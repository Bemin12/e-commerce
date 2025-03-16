const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// For nested routes
// POST /api/v1/reviews
// POST /api/v1/products/:productId/reviews
exports.setProductUserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.product) req.body.product = req.params.productId;

  next();
};

// For nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.productId)
    filterObj = { product: new mongoose.Types.ObjectId(req.params.productId) };
  req.filterObj = filterObj;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Protected: User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PATCH /api/v1/reviews/:id
// @access  Protected: User (owner only)
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Protected: User (owner only), Admin, Manager
exports.deleteReview = factory.deleteOne(Review);
