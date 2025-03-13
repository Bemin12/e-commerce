const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshTokenModel');

const signTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

const createSendTokens = async (statusCode, user, req, res) => {
  const { accessToken, refreshToken } = signTokens(user._id);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(
      Date.now() + process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
  });

  res.cookie('refreshToken', refreshToken, {
    expires: new Date(
      Date.now() + process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: 'strict',
    secure: req.sequre || req.headers['x-forwarded-proto'] === 'https',
  });

  res.status(statusCode).json({ status: 'success', accessToken, data: { user } });
};

module.exports = createSendTokens;
