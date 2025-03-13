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

const subcategoriesRouter = require('./subcategoryRoutes');
const productsRouter = require('./productRoutes');

const authController = require('../controllers/authController');

router.use('/:categoryId/subcategories', getCategorySubcategoriesValidator, subcategoriesRouter);
// router.use('/:categoryId/subcategories/:subcategoryId/products', productsRouter);
router.use('/:categoryId/products', getCategorySubcategoriesValidator, productsRouter);

router
  .route('/')
  .get(getCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory,
  );
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteCategoryValidator,
    deleteCategory,
  );

module.exports = router;
