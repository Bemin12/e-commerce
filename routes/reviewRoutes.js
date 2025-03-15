const router = require('express').Router({ mergeParams: true });
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require('../middlewares/validators/reviewValidator');

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setProductUserIdToBody,
  createFilterObj,
} = require('../controllers/reviewController');

const authController = require('../controllers/authController');
const Review = require('../models/reviewModel');

router
  .route('/')
  .get(createFilterObj, getReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    setProductUserIdToBody,
    createReviewValidator,
    createReview,
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    authController.restrictToOwner(Review),
    updateReviewValidator,
    updateReview,
  )
  .delete(
    authController.protect,
    authController.restrictToOwner(Review),
    deleteReviewValidator,
    deleteReview,
  );

module.exports = router;
