const factory = require('./handlerFactory');
const Coupon = require('../models/couponModel');

// @desc    Get list of Coupons
// @route   GET /api/v1/coupons
// @access  Protected: Admin, Manager
exports.getCoupons = factory.getAll(Coupon);

// @desc    Get specific Coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Protected: Admin, Manager
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create Coupon
// @route   POST /api/v1/coupons
// @access  Protected: Admin, Manager
exports.createCoupon = factory.createOne(Coupon);

// @desc    Update specific Coupon
// @route   PATCH /api/v1/coupons/:id
// @access  Protected: Admin, Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific Coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Protected: Admin
exports.deleteCoupon = factory.deleteOne(Coupon);
