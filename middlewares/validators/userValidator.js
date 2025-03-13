const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');
const User = require('../../models/userModel');

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),
  validatorMiddleware,
];

exports.createUserValidator = [
  check('name').notEmpty().withMessage('Please provide a name').trim(),
  check('email')
    .notEmpty()
    .withMessage('Please provide your email')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('There is already user with this email');
      }
    }),
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
    .custom((val, { req }) => {
      if (val !== req.password) {
        return new Error('password and passwordConfirm are not the same');
      }
      return true;
    }),
  check('profileImg')
    .optional()
    .matches(/\.(jpg|jpeg|png)$/)
    .withMessage('Profile image must be jpg, jpeg, or png format'),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('name').optional().notEmpty().withMessage('Please provide a name').trim(),
  check('email').optional().isEmail().withMessage('Please provide a valid email'),
  check('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  check('profileImg')
    .optional()
    .matches(/\.(jpg|jpeg|png)$/)
    .withMessage('Profile image must be jpg, jpeg, or png format'),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),
  validatorMiddleware,
];
