const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');
const Product = require('../../models/productModel');

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid review id format'),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check('rating')
    .exists()
    .withMessage('Rating is required')
    .bail()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be above or equal to 1 and below or equal to 5'),
  check('user')
    .notEmpty()
    .withMessage('Review must belong to a user')
    .bail()
    .isMongoId()
    .withMessage('Invalid user id format')
    .bail()
    .custom((val, { req }) => val.toString() === req.user._id.toString())
    .withMessage('You are not allowed to create this review'),
  check('product')
    .notEmpty()
    .withMessage('Review must belong to a product')
    .bail()
    .isMongoId()
    .withMessage('Invalid product id format')
    .bail()
    .custom(async (productId) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('No product found with this id');
      }
    }),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be above or equal to 1 and below or equal to 5'),
  check('user')
    .optional()
    .isMongoId()
    .withMessage('Invalid user id format')
    .custom((val, { req }) => val.toString() === req.user._id.toString())
    .withMessage('You are not allowed to create this review'),
  check('product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product id format')
    .bail()
    .custom(async (productId) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('No product found with this id');
      }
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id').isMongoId().withMessage('Invalid review id format'),
  validatorMiddleware,
];
