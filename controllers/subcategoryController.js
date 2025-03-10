const Subcategory = require('../models/subcategoryModel');
const factory = require('./handlerFactory');

exports.setcategoryIdToBody = (req, res, next) => {
  // Allow nested routes
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubcategories = factory.getAll(Subcategory);

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubcategory = factory.getOne(Subcategory);

// Nested route
// POST /api/v1/categories/:categoryId/subcategories

// @desc    Create subcategory
// @route   POST /api/v1/subcategories
// @access  Private
exports.createSubcategory = factory.createOne(Subcategory);

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private
exports.updateSubcategory = factory.updateOne(Subcategory);

// @desc    Delete specific subcategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
exports.deleteSubcategory = factory.deleteOne(Subcategory);
