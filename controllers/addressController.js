const asyncHandler = require('../utils/asyncHandler');
const APIError = require('../utils/apiError');
const User = require('../models/userModel');

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected: User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true },
  );

  res.status(200).json({ status: 'success', data: { addresses: user.addresses } });
});

// @desc    Get current user addresses list
// @route   GET /api/v1/addresses
// @access  Protected: User
exports.getCurrentUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id, { addresses: 1 }, { new: true });

  res.status(200).json({
    status: 'success',
    results: user.addresses.length,
    data: { addresses: user.addresses },
  });
});

// @desc    Update User Address
// @route   PATCH /api/v1/address/:addressId
// @access  Protected: User
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, 'addresses._id': req.params.addressId },
    {
      $set: {
        'addresses.$.alias': req.body.alias,
        'addresses.$.details': req.body.details,
        'addresses.$.phone': req.body.phone,
        'addresses.$.city': req.body.city,
        'addresses.$.postalCode': req.body.postalCode,
      },
    },
    { new: true, runValidators: true },
  );

  if (!user) {
    return next(new APIError(`No address found with this id`, 404));
  }

  res.status(200).json({ status: 'success', data: { addresses: user.addresses } });
});

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/address/:addressId
// @access  Protected: User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true },
  );

  res.status(200).json({ status: 'success', data: { addresses: user.addresses } });
});
