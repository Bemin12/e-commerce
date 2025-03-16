const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel');

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected: User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true },
  );

  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected: User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true },
  );

  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

// @desc    Get current user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected: User
exports.getCurrentUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id, { wishlist: 1 }, { new: true }).populate(
    'wishlist',
  );

  res
    .status(200)
    .json({ status: 'success', results: user.wishlist.length, data: { wishlist: user.wishlist } });
});
