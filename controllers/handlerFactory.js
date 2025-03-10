const mongoose = require('mongoose');
const slugify = require('slugify');
const asyncHandler = require('../utils/asyncHandler');
const APIError = require('../utils/apiError');
const APIFeatures = require('../utils/apiFeatures');

const getResourceName = (Model) => Model.modelName.toLowerCase();

// Approach 1 (Mongoose Query) | Two database trips - one for counting documents and other for data |
/*
exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    // Approach 1 (Mongoose Query)
    let filterObj = {};
    if (req.params.categoryId) filterObj = { category: req.params.categoryId };

    const features = new APIFeatures(Model.find(filterObj), req.query)
      .filter()
      .search()
      .sort()
      .limitFields();

    await features.count();
    const { query, paginationResult } = features.paginate(features.count);
    
    const docs = await query;
    const resourceName = `${getResourceName(Model)}s`;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      paginationResult,
      data: { [resourceName]: docs },
    });
  });
*/

// Approach 2 (Aggregation) | One database trip by using $facet stage in aggregation pipeline |
exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    let filterObj = {};
    if (req.params.categoryId)
      filterObj = { category: new mongoose.Types.ObjectId(req.params.categoryId) };

    const features = new APIFeatures(Model.aggregate([{ $match: filterObj }]), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const [{ data: docs, count }] = await features.aggregation;
    const resourceName = `${getResourceName(Model)}s`;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      numOfPages: count[0].numOfPages,
      data: { [resourceName]: docs },
    });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    // const { query } = new APIFeatures(Model.findById(req.params.id), req.query).limitFields();
    // const doc = await query;

    const doc = await Model.findById(req.params.id);
    const resourceName = getResourceName(Model);

    if (!doc) {
      return next(new APIError(`No ${resourceName} found with this is`, 404));
    }

    res.status(200).json({ status: 'success', data: { [resourceName]: doc } });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    const doc = await Model.create(req.body);
    const resourceName = getResourceName(Model);

    res.status(201).json({ status: 'success', [resourceName]: doc });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const resourceName = getResourceName(Model);

    if (!doc) {
      return next(new APIError(`No ${resourceName} found with this is`, 404));
    }

    res.status(200).json({ status: 'success', data: { [resourceName]: doc } });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    const resourceName = getResourceName(Model);

    if (!doc) {
      return next(new APIError(`No ${resourceName} found with this is`, 404));
    }

    res.status(201).send();
  });
