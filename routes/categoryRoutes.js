const router = require('express').Router();
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
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

router.use('/:categoryId/subcategories', subcategoriesRouter);

router
  .route('/')
  .get(getCategories)
  .post(uploadCategoryImage, resizeImage, createCategoryValidator, createCategory);
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(uploadCategoryImage, resizeImage, updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

module.exports = router;
