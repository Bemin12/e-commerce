const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');

exports.getCategoryValidator = [
  // Creates a middleware/validation chain for one or more fields that may be located in any of the following:
  // req.body, req.cookies, req.headers, req.params, req.query
  check('id').isMongoId().withMessage('Invalid category id format'),

  validatorMiddleware,
];

exports.getCategorySubcategoriesValidator = [
  check('categoryId').isMongoId().withMessage('Invalid category id format'),

  validatorMiddleware,
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category name is required')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name'),
  check('image')
    .optional()
    .matches(/\.(jpg|jpeg|png)$/i)
    .withMessage('Image must be jpg, jpeg, or png format'),

  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name'),
  check('image')
    .optional()
    .matches(/\.(jpg|jpeg|png)$/i)
    .withMessage('Image must be jpg, jpeg, or png format'),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware,
];
