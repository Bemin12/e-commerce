const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');

const Product = require('../../models/productModel');

exports.addProductToWishlistValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid product id format')
    .bail()
    .custom(async (val) => {
      const product = await Product.findById(val);
      if (!product) {
        throw new Error('No product found with this id');
      }
    }),
  validatorMiddleware,
];

exports.removeProductFromWishlistValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid product id format'),
  validatorMiddleware,
];
