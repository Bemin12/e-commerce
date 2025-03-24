const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Product id is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  price: Number,
  quantity: {
    type: Number,
    min: [1, 'quantity must be a positive number'],
  },
  color: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    orderItems: [orderItemSchema],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    totalPrice: Number,
    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true },
);

// To get users data upon get all orders request for admins
orderSchema.pre('aggregate', function (next) {
  // Skip getting user data if orders were requested for specific user
  if (this.pipeline()[0]?.$match?.user) return next();

  this.pipeline().splice(
    -2,
    0,
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  next();
});

module.exports = mongoose.model('Order', orderSchema);
