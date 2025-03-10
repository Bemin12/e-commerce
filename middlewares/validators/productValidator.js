const { check } = require('express-validator');
const validatorMiddleware = require('../validatorMiddleware');
const Category = require('../../models/categoryModel');
const Subcategory = require('../../models/subcategoryModel');

exports.createProductValidator = [
  check('name')
    .notEmpty()
    .withMessage('Product name is required')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Too short product name')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Too long product name')
    .trim(),
  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .bail()
    .isLength({ min: 20 })
    .withMessage('Too short product description'),
  check('quantity')
    .exists()
    .withMessage('Product quantity is required')
    .bail()
    .isInt({ min: 0 })
    .withMessage('Product quantity must be a positive integer'),
  check('sold').optional().isInt({ min: 0 }).withMessage('Sold quantity must be a positive number'),
  check('price')
    .exists()
    .withMessage('Product price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Product priceAfterDiscount must be a number')
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error('Discount price should be below regular price');
      }
      return true;
    }),
  check('colors')
    .optional()
    .isArray()
    .withMessage('colors should be an array of strings')
    .notEmpty()
    .withMessage('colors should be an array of non-empty strings'),
  check('imageCover')
    .notEmpty()
    .withMessage('Product imageCover is required')
    .bail()
    .matches(/\.(jpg|jpeg|png)$/i)
    .withMessage('Image must be jpg, jpeg, or png format'),
  check('images')
    .optional()
    .isArray()
    .withMessage('imgaes should be array of strings')
    .custom((images) =>
      images.every((img) => {
        console.log(img);
        return /\.(jpg|jpeg|png)$/i.test(img);
      }),
    )
    .withMessage('Images must be jpg, jpeg, or png format'),
  check('category')
    .notEmpty()
    .withMessage('Product must belong to category')
    .bail()
    .isMongoId()
    .withMessage('Invalid category id format')
    .bail()
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error(`No category for this id: ${categoryId}`);
      }
    }),
  check('subcategories')
    .optional()
    .isArray()
    .withMessage('subcategories must be array of MongoIds')
    .bail()
    .isMongoId()
    .withMessage('Invalid subcategory Id format')
    .bail()
    .custom(async (subcategoriesIds, { req }) => {
      const subcategories = await Subcategory.find({
        _id: { $in: subcategoriesIds },
        category: req.body.category,
      });
      if (!subcategories.length || subcategories.length !== subcategoriesIds.length) {
        throw new Error('Invalid subcategories Ids');
      }
    }),
  check('brand').optional().isMongoId().withMessage('Invalid brand id format'),
  check('ratingsAverage')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be a number above or equal to 1 and below or equal to 5'),
  check('ratingsQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('ratingsQuantity must be a positive integer'),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid product id format'),
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short product name')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Too long product name')
    .trim(),
  check('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Too short product description'),
  check('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Product quantity must be a positive integer'),
  check('sold').optional().isNumeric().withMessage('Sold quantity must be a number'),
  check('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Product priceAfterDiscount must be a number')
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error('Discount price should be below regular price');
      }
      return true;
    }),
  check('colors')
    .optional()
    .isArray()
    .withMessage('colors should be an array of strings')
    .notEmpty()
    .withMessage('colors should be an array of strings'),
  check('imageCover')
    .optional()
    .matches(/\.(jpg|jpeg|png)$/i)
    .withMessage('Image must be jpg, jpeg, or png format'),
  check('images')
    .optional()
    .isArray()
    .withMessage('imgaes should be array of strings')
    .custom((images) => images.every((img) => /\.(jpg|jpeg|png)$/i.test(img))),
  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category id format')
    .bail()
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error(`No category for this id: ${categoryId}`);
      }
    }),
  check('subcategories')
    .optional()
    .isArray()
    .withMessage('subcategories must be array of MongoIds')
    .bail()
    .isMongoId()
    .withMessage('Invalid Id format')
    .bail()
    .custom(async (subcategoriesIds, { req }) => {
      const subcategories = await Subcategory.find({
        _id: { $in: subcategoriesIds },
        category: req.body.category,
      });
      if (!subcategories.length || subcategories.length !== subcategoriesIds.length) {
        throw new Error('Invalid subcategories Ids');
      }
    }),
  check('brand').optional().isMongoId().withMessage('Invalid brand id format'),
  check('ratingsAverage')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be a number above or equal to 1 and below or equal to 5'),
  check('ratingsQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('ratingsQuantity must be a positive integer'),

  validatorMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid id format'),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid id format'),
  validatorMiddleware,
];
