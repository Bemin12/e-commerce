const router = require('express').Router();
const {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} = require('../middlewares/validators/wishlistValidator');

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getCurrentUserWishlist,
} = require('../controllers/wishlistController');

const authController = require('../controllers/authController');

router.use(authController.protect, authController.restrictTo('user'));

router
  .route('/')
  .get(getCurrentUserWishlist)
  .post(addProductToWishlistValidator, addProductToWishlist);

router.delete('/:productId', removeProductFromWishlistValidator, removeProductFromWishlist);

module.exports = router;
