const router = require('express').Router();
const {
  addAddressValidator,
  removeAddressValidator,
} = require('../middlewares/validators/addressValidator');

const {
  addAddress,
  removeAddress,
  getCurrentUserAddresses,
  updateAddress,
} = require('../controllers/addressController');

const authController = require('../controllers/authController');

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').get(getCurrentUserAddresses).post(addAddressValidator, addAddress);

router.delete('/:addressId', removeAddressValidator, removeAddress);
router.patch('/:addressId', updateAddress);

module.exports = router;
