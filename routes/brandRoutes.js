const router = require('express').Router();
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../middlewares/validators/brandValidator');

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require('../controllers/brandController');

const authController = require('../controllers/authController');

router
  .route('/')
  .get(getBrands)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand,
  );
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    deleteBrandValidator,
    deleteBrand,
  );

module.exports = router;
