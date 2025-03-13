const router = require('express').Router({ mergeParams: true });
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../middlewares/validators/productValidator');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require('../controllers/productController');

const { protect, restrictTo } = require('../controllers/authController');

router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    restrictTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct,
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .patch(
    protect,
    restrictTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct,
  )
  .delete(protect, restrictTo('admin'), deleteProductValidator, deleteProduct);

module.exports = router;
