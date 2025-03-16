const router = require('express').Router({ mergeParams: true });
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  getProductReviewsValidator,
} = require('../middlewares/validators/productValidator');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
  createFilterObj,
} = require('../controllers/productController');

const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

router.use('/:productId/reviews', getProductReviewsValidator, reviewRouter);

router
  .route('/')
  .get(createFilterObj, getProducts)
  .post(
    protect,
    restrictTo('admin', 'manager'),
    uploadProductImages,
    createProductValidator,
    resizeProductImages,
    createProduct,
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .patch(
    protect,
    restrictTo('admin', 'manager'),
    uploadProductImages,
    updateProductValidator,
    resizeProductImages,
    updateProduct,
  )
  .delete(protect, restrictTo('admin'), deleteProductValidator, deleteProduct);

module.exports = router;
