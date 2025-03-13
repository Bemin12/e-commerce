const router = require('express').Router({ mergeParams: true });
const {
  getSubcategoryValidator,
  createSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
} = require('../middlewares/validators/subcategoryValidator');

const {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  setcategoryIdToBody,
} = require('../controllers/subcategoryController');

const authController = require('../controllers/authController');
const productsRouter = require('./productRoutes');

router.use('/:subcategoryId/products', productsRouter);

router
  .route('/')
  .get(getSubcategories)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    setcategoryIdToBody,
    createSubcategoryValidator,
    createSubcategory,
  );

router
  .route('/:id')
  .get(getSubcategoryValidator, getSubcategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    updateSubcategoryValidator,
    updateSubcategory,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteSubcategoryValidator,
    deleteSubcategory,
  );

module.exports = router;
