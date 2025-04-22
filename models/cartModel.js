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
      unique: true,
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

const setItemQuantityChanged = (item, availableQuantity) => {
  item.availabilityChanged = true;
  item.exists = true;
  item.quantityInCart = item.quantity;
  item.availableQuantity = availableQuantity;
};

const setItemNotAvailable = (item) => {
  item.availabilityChanged = true;
  item.exists = false;
};

cartSchema.methods.detectProductQuantityAvailability = function () {
  let productChanged = false;
  const cartObj = {};
  Object.assign(cartObj, this.toObject());
  cartObj.cartItems.forEach((item) => {
    // Product exist
    if (item.product) {
      // Item with color
      if (item.color) {
        const variant = item.product.variants.find((prod) => prod.color === item.color);
        // variant exists
        if (variant) {
          if (variant.quantity < item.quantity) {
            productChanged = true;
            setItemQuantityChanged(item, variant.quantity);
          }
        }
        // variant doesn't exist
        else {
          productChanged = true;
          setItemNotAvailable(item);
        }
      }
      // Item without color
      else if (item.product.quantity < item.quantity) {
        productChanged = true;
        setItemQuantityChanged(item, item.product.quantity);
      }
    }
    // Product doesn't exist
    else {
      productChanged = true;
      setItemNotAvailable(item);
    }
  });

  return { productChanged, cartObj };
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
