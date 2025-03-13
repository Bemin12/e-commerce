const router = require('express').Router();

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
} = require('../middlewares/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/me').get(getMe, getUser).patch(updateUserValidator, updateMe).delete(deleteMe);

router.use(authController.restrictTo('admin', 'manager'));

router.route('/').get(getUsers).post(createUserValidator, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .patch(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
