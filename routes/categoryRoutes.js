const router = require('express').Router();
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getCategorySubcategoriesValidator,
} = require('../middlewares/validators/categoryValidator');

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require('../controllers/categoryController');

const subcategoryRouter = require('./subcategoryRoutes');
const productRouter = require('./productRoutes');

const authController = require('../controllers/authController');

router.use('/:categoryId/subcategories', getCategorySubcategoriesValidator, subcategoryRouter);
// router.use('/:categoryId/subcategories/:subcategoryId/products', productRouter);
router.use('/:categoryId/products', getCategorySubcategoriesValidator, productRouter);

router
  .route('/')
  .get(getCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadCategoryImage,
    createCategoryValidator,
    resizeImage,
    createCategory,
  );
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadCategoryImage,
    updateCategoryValidator,
    resizeImage,
    updateCategory,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteCategoryValidator,
    deleteCategory,
  );

module.exports = router;
