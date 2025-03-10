const router = require('express').Router();
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

router
  .route('/')
  .get(getProducts)
  .post(uploadProductImages, resizeProductImages, createProductValidator, createProduct);
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .patch(uploadProductImages, resizeProductImages, updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

module.exports = router;
