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

router
  .route('/')
  .get(getBrands)
  .post(uploadBrandImage, resizeImage, createBrandValidator, createBrand);
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .patch(uploadBrandImage, resizeImage, updateBrandValidator, updateBrand)
  .delete(deleteBrandValidator, deleteBrand);

module.exports = router;
