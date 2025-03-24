const router = require('express').Router();

const Order = require('../models/orderModel');

const {
  createCashOrder,
  getOrders,
  getOrder,
  createFilterObject,
  updateOrderStatus,
  getCheckoutSession,
  cancelCashOrder,
} = require('../controllers/orderController');

const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(createFilterObject, getOrders)
  .post(authController.restrictTo('user'), createCashOrder);

router.get('/checkout-session', getCheckoutSession);

router
  .route('/:id')
  .get(authController.restrictToOwner(Order), getOrder)
  .delete(authController.restrictToOwner(Order), cancelCashOrder);

router.patch('/:id/status', authController.restrictTo('admin', 'manager'), updateOrderStatus);

module.exports = router;
