const router = require('express').Router();
const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require('../middlewares/validators/couponValidator');

const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

const authController = require('../controllers/authController');

router.use(authController.protect, authController.restrictTo('admin', 'manager'));

router.route('/').get(getCoupons).post(createCouponValidator, createCoupon);
router
  .route('/:id')
  .get(getCouponValidator, getCoupon)
  .patch(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
