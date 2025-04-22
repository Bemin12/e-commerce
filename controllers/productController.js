const { mongoose } = require('mongoose');
const sharp = require('sharp');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const APIError = require('../utils/apiError');

exports.uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // console.log(req.body);
  if (!req.files?.imageCover && !req.files?.images) return next();

  if (req.files.imageCover) {
    const filename = `product-${Math.round(Math.random() * 1e9)}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${filename}`);

    req.body.imageCover = `/products/${filename}`;
  }

  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map((image, i) => {
        const filename = `product-${Math.round(Math.random() * 1e9)}-${Date.now()}-${i + 1}.jpeg`;
        sharp(req.files.imageCover[0].buffer)
          .resize(500, 500)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${filename}`);

        req.body.images.push(`/products/${filename}`);
      }),
    );
  }

  next();
});

// For nested routes
// GET /api/v1/categories/:categoryId/products
// GET /api/v1/subcategories/:subcategoryId/products
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId)
    filterObj = { category: new mongoose.Types.ObjectId(req.params.categoryId) };
  if (req.params.subcategoryId)
    filterObj = { subcategories: new mongoose.Types.ObjectId(req.params.subcategoryId) };

  req.filterObj = filterObj;
  next();
};

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product);

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product);

// @desc    Create product
// @route   POST /api/v1/products
// @access  Protected: Admin, Manager
exports.createProduct = factory.createOne(Product);

// @desc    Update specific product
// @route   PATCH /api/v1/products/:id
// @access  Protected: Admin, Manager
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Protected: Admin
exports.deleteProduct = factory.deleteOne(Product);

exports.addProductVariant = asyncHandler(async (req, res, next) => {
  const { id: productId } = req.params;
  const { color, quantity } = req.body;

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: { variants: { color, quantity } },
    },
    { new: true },
  );

  if (!product) {
    return next(new APIError('Product not found', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

exports.updateProductVariantQuantity = asyncHandler(async (req, res, next) => {
  const { id: productId, variantId } = req.params;
  const { quantity } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: productId, 'variants._id': variantId },
    { $set: { 'variants.$.quantity': quantity } },
    { new: true },
  );

  if (!product) {
    return next(new APIError('Product or variant not found', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

exports.removeProductVariant = asyncHandler(async (req, res, next) => {
  const { id: productId, variantId } = req.params;

  const product = await Product.findOneAndUpdate(
    { _id: productId, 'variants._id': variantId },
    { $pull: { variants: { _id: variantId } } },
    { new: true },
  );

  if (!product) {
    return next(new APIError('Product or variant not found', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});
