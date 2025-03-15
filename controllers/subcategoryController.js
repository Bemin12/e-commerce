const { mongoose } = require('mongoose');
const Subcategory = require('../models/subcategoryModel');
const factory = require('./handlerFactory');

// For nested route
// POST /api/v1/categories/:categoryId/subcategories
exports.setcategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// For nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId)
    filterObj = { category: new mongoose.Types.ObjectId(req.params.categoryId) };

  req.filterObj = filterObj;
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
// @access  Protected: Admin, Manager
exports.createSubcategory = factory.createOne(Subcategory);

// @desc    Update specific subcategory
// @route   PATCH /api/v1/subcategories/:id
// @access  Protected: Admin, Manager
exports.updateSubcategory = factory.updateOne(Subcategory);

// @desc    Delete specific subcategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Protected: Admin
exports.deleteSubcategory = factory.deleteOne(Subcategory);
