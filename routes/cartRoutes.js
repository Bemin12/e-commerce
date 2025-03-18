const router = require('express').Router();
const {
  addProductToCartValidator,
  removeSpecificCartItemValidator,
  updateCartItemQuantityValidator,
} = require('../middlewares/validators/cartValidator');

const {
  addProductToCart,
  getCurrentUserCart,
  removeSpecifCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require('../controllers/cartController');

const authController = require('../controllers/authController');

router.use(authController.protect, authController.restrictTo('user'));

router
  .route('/')
  .get(getCurrentUserCart)
  .post(addProductToCartValidator, addProductToCart)
  .delete(clearCart);
router.patch('/applyCoupon', applyCoupon);
router
  .route('/:itemId')
  .delete(removeSpecificCartItemValidator, removeSpecifCartItem)
  .patch(updateCartItemQuantityValidator, updateCartItemQuantity);

module.exports = router;
