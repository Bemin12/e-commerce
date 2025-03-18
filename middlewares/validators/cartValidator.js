const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');

exports.addProductToCartValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid product id format'),
  check('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive number'),
  check('color').optional().isString(),
  validatorMiddleware,
];

exports.removeSpecificCartItemValidator = [
  check('itemId').isMongoId().withMessage('Invalid item id format'),
  validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
  check('itemId').isMongoId().withMessage('Invalid item id format'),
  check('quantity')
    .exists()
    .withMessage('Quantity is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive number'),
  validatorMiddleware,
];
