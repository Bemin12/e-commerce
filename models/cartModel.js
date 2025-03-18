const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    min: [1, 'quantity must be a positive number'],
    default: 1,
  },
  color: String,
  price: Number,
});

const cartSchema = new mongoose.Schema(
  {
    cartItems: [cartItemSchema],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true },
);

cartSchema.methods.calcTotalCartPrice = function (productPrice, addedQuantity) {
  if (productPrice && addedQuantity) {
    this.totalCartPrice += productPrice * addedQuantity;
  }
  this.totalPriceAfterDiscount = undefined;
};

module.exports = mongoose.model('Cart', cartSchema);
