const sharp = require('sharp');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');

exports.uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
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
// @access  Private
exports.createProduct = factory.createOne(Product);

// @desc    Update specific product
// @route   PATCH /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);
