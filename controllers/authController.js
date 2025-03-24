const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const APIError = require('../utils/apiError');
const Email = require('../utils/email');
const createSendTokens = require('../utils/createSendTokens');

// @desc    Sign up a new user
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Send a generic success message after 2 to 2.7 seconds instead of just sending an error if user already exists for security reasons.
    setTimeout(
      () =>
        res.status(201).json({
          status: 'success',
          message: `To continue, enter the code sent to ${email}`,
        }),
      Math.floor(Math.random() * 701) + 2000,
    );

    return;
  }

  const user = new User({ name, email, password, phone });
  const verificationCode = user.createVerificationCode();
  await user.save();

  try {
    await new Email(user, verificationCode).sendVerifyEmail();
  } catch (err) {
    await user.deleteOne();
    return next(new APIError('There was an error sending the email. Please try again', 500));
  }

  res
    .status(201)
    .json({ status: 'success', message: `To continue, enter the code sent to ${email}` });
});

// @desc    Verify user email
// @route   PATCH /api/v1/auth/verifyEmail
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return next(new APIError('Please provide email and verification code', 400));
  }

  const hashedVerificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
  const user = await User.findOneAndUpdate(
    {
      email,
      verificationCode: hashedVerificationCode,
      verificationCodeExpires: { $gt: Date.now() },
    },
    { $set: { verified: true }, $unset: { verificationCode: '', verificationCodeExpires: '' } },
    {
      new: true,
    },
  ).select('-addresses -wishlist');

  if (!user) {
    return next(new APIError('Invalid or expired verification code', 400));
  }

  createSendTokens(200, user, req, res);
});

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new APIError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password -addresses -wishlist');

  if (!user || !(await user.correctPassword(password))) {
    return next(new APIError('Incorrect email or password', 400));
  }

  if (!user.verified) {
    return next(new APIError('Please verify your email before logging in', 401));
  }

  createSendTokens(200, user, req, res);
});

// @desc    Authenticate users
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new APIError('You are not logged in! Please log in to get access', 401));
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const currentUser = await User.findById(decoded.id).select('-addresses');
  if (!currentUser) {
    return next(new APIError('The user belonging to this token does no longer exist', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new APIError('User recently changed password! Please log in again', 401));
  }

  if (!currentUser.verified) {
    return next(new APIError('Please verify your email', 401));
  }

  req.user = currentUser;
  next();
});

// @desc    Authorization | Check user permissions
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new APIError('You do not have permission to access this route', 403));
    }

    next();
  };

exports.restrictToOwner = (Model) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    query.skipPopulation = true; // defined property to skip user population in reviewModel

    const doc = await query;
    if (!doc) {
      return next(new APIError(`No ${Model.modelName.toLowerCase()} found with this id`, 404));
    }

    const resourceOwner = doc.user;
    if (
      !req.user._id.equals(resourceOwner._id) &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return next(new APIError('You do not have the permission to perform this action', 403));
    }

    next();
  });

// @desc    Refresh access token and rotate refresh token
// @route   POST /api/v1/auth/refreshToken
// @access  Public - needs a valid refresh token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new APIError('Refresh token required', 401));
  }

  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const existingToken = await RefreshToken.findOneAndDelete({ token: hashedToken });
  if (!existingToken) {
    return next(new APIError('Invalid or expired token', 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new APIError('The user belonging to this token does no longer exist', 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new APIError('User recently changed password! Please log in again'));
  }

  createSendTokens(200, user, req, res);
});

// @desc    Update current user password
// @route   PATCH /api/v1/auth/updateMyPassword
// @access  Protected
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { passwordCurrent, password } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.correctPassword(passwordCurrent))) {
    return next(new APIError('Password is incorrect', 401));
  }

  user.password = password;
  await user.save();

  await RefreshToken.deleteMany({ user: user._id });
  createSendTokens(201, user, req, res);
});

// @desc    Send password reset token to email
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new APIError('Provide the email', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    setTimeout(
      () => {
        res.status(200).json({
          status: 'success',
          message: 'If an account with that email exists, a password reset link has been sent.',
        });
      },
      Math.floor(Math.random * 701) + 2000,
    );
    return;
  }

  // const token = user.createPasswordResetToken();
  const resetCode = user.createPasswordResetCode();
  await user.save();

  // for existence of frontend we can replace a url to the website
  // const url = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${token}`;

  try {
    await new Email(user, resetCode).sendPasswordReset();
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(new APIError('There was an error sending the email. Please try again', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// @desc    Verify reset password code
// @route   POST /api/v1/auth/verifyResetCode/
// @access  Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;

  if (!email || !resetCode) {
    return next(new APIError('Please provide email and verification code', 400));
  }

  const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  const user = await User.findOne({
    email,
    passwordResetCode: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    // return next(new APIError('Invalid or expired token. Pleas log in again', 400));
    return next(new APIError('Invalid or expired reset code.', 400));
  }

  res.status(200).json({ status: 'success' });
});

// @desc    Reset password using token
// @route   PATCH /api/v1/auth/resetPassword/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const hashedCode = crypto.createHash('sha256').update(req.params.resetCode).digest('hex');
  const user = await User.findOne({
    email,
    passwordResetCode: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new APIError('Invalid or expired token. Pleas log in again', 400));
  }

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.password = password;
  await user.save();

  await RefreshToken.deleteMany({ user: user._id });

  createSendTokens(200, user, req, res);
});
