const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Product id is required'],
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
      required: true,
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

cartSchema.methods.detectProductQuantityAvailability = function () {
  // Array to hold products that became unavailable or a its quantity decreased
  const productsChanged = [];
  this.cartItems.forEach((item) => {
    // Product exist
    if (item.product) {
      if (item.product.quantity < item.quantity) {
        productsChanged.push({
          item,
          exists: true,
          quantityInCart: item.quantity,
          availableQuantity: item.product.quantity,
        });
      }
    }
    // Product doesn't exist
    else {
      productsChanged.push({
        item,
        exists: false,
      });
    }
  });

  return productsChanged;
};

cartSchema.methods.detectPriceChange = function () {
  let priceChange = false;
  // Iterate over each item and compare its price when first added with the current price
  this.cartItems.forEach((item) => {
    // If there is difference in the price, update the item price and the totalCartPrice
    if (item.product.price !== item.price) {
      this.totalCartPrice -= item.price * item.quantity;
      item.price = item.product.price;
      this.totalCartPrice += item.price * item.quantity;

      priceChange = true;
    }
  });

  if (priceChange) this.totalPriceAfterDiscount = undefined;

  return priceChange;
};

module.exports = mongoose.model('Cart', cartSchema);
