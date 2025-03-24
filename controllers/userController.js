const asyncHandler = require('../utils/asyncHandler');
const factory = require('./handlerFactory');
const filterObj = require('../utils/filterObj');
const User = require('../models/userModel');
const APIError = require('../utils/apiError');

// @desc    Get current user
// @route   GET api/v1/users/me
// @access  Private[Protect]
exports.getMe = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update current user
// @route   PATCH api/v1/users/me
// @access  Private[Protect]
exports.updateMe = asyncHandler(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new APIError('This route is not for password updates. Please use /updateMyPassword', 400),
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'phone');

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user } });
});

// @desc    De-activate current user
// @route   DELETE api/v1/users/me
// @access  Private[Protect]
exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).send();
});

// @desc    Create user
// @route   POST api/v1/users
// @access  Private[Admin]
exports.createUser = factory.createOne(User);

// @desc    Get list of users
// @route   GET api/v1/users
// @access  Private[Admin]
exports.getUsers = factory.getAll(User);

// @desc    Get specific user
// @route   GET api/v1/users/:id
// @access  Private[Admin]
exports.getUser = factory.getOne(User);

// @desc    Update specific user
// @route   PATCH api/v1/users/:id
// @access  Private[Admin]
exports.updateUser = asyncHandler(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'phone', 'email', 'role', 'profileImg');

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user } });
});

// @desc    Delete specific user
// @route   DELETE api/v1/users/:id
// @access  Private[Admin]
exports.deleteUser = factory.deleteOne(User);
