const router = require('express').Router({ mergeParams: true });
const {
  getSubcategoryValidator,
  createSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
  getSubcategoryProductsValidator,
} = require('../middlewares/validators/subcategoryValidator');

const {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  setcategoryIdToBody,
  createFilterObj,
} = require('../controllers/subcategoryController');

const authController = require('../controllers/authController');
const productRouter = require('./productRoutes');

router.use('/:subcategoryId/products', getSubcategoryProductsValidator, productRouter);

router
  .route('/')
  .get(createFilterObj, getSubcategories)
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
