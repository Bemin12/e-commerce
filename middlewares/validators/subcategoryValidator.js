// const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');
const Category = require('../../models/categoryModel');

exports.getSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subcategory id format'),

  validatorMiddleware,
];

exports.createSubcategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Subcategory name is required')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Too short subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long subcategory name'),
  // .custom((name, { req }) => {
  //   req.body.slug = slugify(name); // setting the slug
  //   return true;
  // })
  check('category')
    .notEmpty()
    .withMessage('Subcategory must belong to parent category')
    .bail()
    .isMongoId()
    .withMessage('Invalid subcategory id format')
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error('No category found with this id');
      }
    }),
  validatorMiddleware,
];

exports.updateSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subcategory id format'),
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long subcategory name'),
  // .custom((name, { req }) => {
  //   req.body.slug = slugify(name); // setting the slug
  //   console.log(req.body);
  //   return true;
  // })
  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid subcategory id format')
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error('No category found with this id');
      }
    }),
  validatorMiddleware,
];

exports.deleteSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subcategory id format'),
  validatorMiddleware,
];

exports.getSubcategoryProductsValidator = [
  check('subcategoryId').isMongoId().withMessage('Invalid subcategory id format'),

  validatorMiddleware,
];
