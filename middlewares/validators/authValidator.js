const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');
// const User = require('../../models/userModel');

exports.signupValidator = [
  check('name').notEmpty().withMessage('Please provide a name').trim(),
  check('email')
    .notEmpty()
    .withMessage('Please provide your email')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email'),
  // .custom(async (email) => {
  //   const existingUser = await User.findOne({ email });
  //   if (existingUser) {
  //     throw new Error('There is already user with this email');
  //   }
  // }),
  check('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  check('password')
    .notEmpty()
    .withMessage('Please provide a password')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Too short password'),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('Please confirm your password')
    .bail()
    .custom((val, { req }) => val === req.body.password)
    .withMessage('password and passwordConfirm are not the same'),
  check('profileImg')
    .optional()
    .matches(/\.(jpg|jpeg|png)$/)
    .withMessage('Profile image must be jpg, jpeg, or png format'),
  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Please provide your email')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('password').notEmpty().withMessage('Please provide a password'),

  validatorMiddleware,
];

exports.updatePasswordValidator = [
  check('passwordCurrent').notEmpty().withMessage('Please provide current password'),
  check('password')
    .notEmpty()
    .withMessage('Please provide new password')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Too short password'),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('Please confirm new password')
    .bail()
    .custom((val, { req }) => val === req.body.password)
    .withMessage('password and passwordConfirm are not the same'),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  // check('token').notEmpty().withMessage('Reset token is required'),
  check('email').notEmpty().withMessage('Please provide email'),
  check('password')
    .notEmpty()
    .withMessage('Please provide new password')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Too short password'),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('Please confirm new password')
    .bail()
    .custom((val, { req }) => val === req.body.password)
    .withMessage('password and passwordConfirm are not the same'),
  validatorMiddleware,
];
