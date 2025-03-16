const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');

exports.addAddressValidator = [
  check('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  check('postalCode').isPostalCode('any').withMessage('Please provide a valid postal code'),
  validatorMiddleware,
];

exports.removeAddressValidator = [
  check('addressId')
    .notEmpty()
    .withMessage('address id is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid address id format'),
  validatorMiddleware,
];
