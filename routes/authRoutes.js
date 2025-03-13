const router = require('express').Router();

const {
  signupValidator,
  loginValidator,
  updatePasswordValidator,
  resetPasswordValidator,
} = require('../middlewares/validators/authValidator');

const {
  signup,
  verifyEmail,
  login,
  protect,
  updatePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  refreshToken,
} = require('../controllers/authController');

router.post('/signup', signupValidator, signup);
router.patch('/verifyEmail', verifyEmail);
router.post('/login', loginValidator, login);
router.patch('/updateMyPassword', protect, updatePasswordValidator, updatePassword);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyResetCode);
router.patch('/resetPassword/:resetCode', resetPasswordValidator, resetPassword);
router.post('/refreshToken', refreshToken);

module.exports = router;
