const stripe = require('stripe')(process.env.STRIPE_API_SECRET);

const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const APIError = require('../utils/apiError');
const factory = require('./handlerFactory');

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Create cash order
// @route   POST /api/v1/orders
// @access  Protected: User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  // Get current user cart
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select: 'name imageCover price quantity',
    options: { skipPopulation: true },
  });

  if (!cart) {
    return next(new APIError('There is no cart for this user', 404));
  }

  // Check if any product becomes unavailable or a change happened in the stock
  const productsChanged = cart.detectProductQuantityAvailability();
  if (productsChanged.length) {
    return res.status(200).json({
      status: 'warn',
      message: 'Some products are no longer available or are in less than the required quantity.',
      data: { productsChanged },
    });
  }

  // Check if a change in a product price in the cart happened
  const priceChange = cart.detectPriceChange();
  // If there is a change, the cart will be updated with the new price and the order will be cancelled to warn user
  if (priceChange) {
    cart = await cart.save();
    return res.status(200).json({
      status: 'warn',
      message:
        'There are some changes happened to product prices in the cart. Please reconfirm the order',
      data: { cart },
    });
  }

  // Set cart price to the total price after discount if a coupon is applied
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  // Add tax and shipping to total price
  const taxPrice = 0;
  const shippingPrice = 0;
  const totalPrice = cartPrice + taxPrice + shippingPrice;

  // Set order items
  const orderItems = cart.cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    imageCover: item.product.imageCover,
    price: item.product.price,
    quantity: item.quantity,
    color: item.color,
  }));

  // Start session and transaction
  const session = await mongoose.startSession();
  try {
    // With using withTransaction() method, you don't need to manually call startTransaction(), commitTransaction(), or abortTransaction()
    // The withTransaction() method in MongoDB comes with an automatic retry mechanism for transient errors.
    const result = await session.withTransaction(async () => {
      // Create the order
      const order = await Order.create(
        [
          {
            user: req.user._id,
            orderItems,
            shippingAddress,
            totalPrice,
          },
        ],
        { session },
      );

      // Product `quantity` and `sold` updates
      const writes = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
        },
      }));

      // Update products
      await Product.bulkWrite(writes, { session });

      // Delete user cart
      await Cart.deleteOne({ user: req.user._id }, { session });

      return order[0];
    });

    res.status(201).json({ status: 'success', data: { order: result } });
  } catch (err) {
    next(new APIError(`Checkout failed: ${err.message}`));
  } finally {
    session.endSession();
  }
});

// User can only see his orders
exports.createFilterObject = (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: new mongoose.Types.ObjectId(req.user._id) };
  next();
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Protected
exports.getOrders = factory.getAll(Order);

// @desc    Get specific order
// @route   GET /api/v1/orders/:id
// @access  Protected
exports.getOrder = factory.getOne(Order);

exports.cancelCashOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new APIError('No order found with this id', 404));
  }

  if (order.paymentMethod !== 'cash') {
    return next(new APIError('Order is not cash order'));
  }

  if (order.isPaid) {
    return next(new APIError('Order is already paid', 400));
  }

  await order.deleteOne();

  res.status(204).send();
});

// @desc    Update order status (paid, delivered)
// @route   PATCH /api/v1/orders/:id
// @access  Protected: Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { isPaid = false, isDelivered = false } = req.body;

  const updateObj = {};
  if (isPaid) {
    updateObj.isPaid = true;
    updateObj.paidAt = Date.now();
  }
  if (isDelivered) {
    updateObj.isDelivered = true;
    updateObj.deliveredAt = Date.now();
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateObj }, { new: true });

  res.status(200).json({ status: 'success', data: { order } });
});

// @desc    Get checkout session from stripe
// @route   GET /api/v1/orders/checkout-session
// @access  Protected
exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  // Get current user cart
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select: 'name imageCover price quantity',
    options: { skipPopulation: true },
  });

  if (!cart) {
    return next(new APIError('There is no cart for this user', 404));
  }

  // Check if any product becomes unavailable or a change happened in the stock
  const productsChanged = cart.detectProductQuantityAvailability();
  if (productsChanged.length) {
    return res.status(200).json({
      status: 'warn',
      message: 'Some products are no longer available or are in less than the required quantity.',
      data: { productsChanged },
    });
  }

  // Check if a change in a product price in the cart happened
  const priceChange = cart.detectPriceChange();
  // If there is a change, the cart will be updated with the new price and the order will be cancelled to warn user
  if (priceChange) {
    cart = await cart.save();
    return res.status(200).json({
      status: 'warn',
      message:
        'There are some changes happened to product prices in the cart. Please reconfirm the order',
      data: { cart },
    });
  }

  // Add tax and shipping to total price
  const taxPrice = 0;
  const shippingPrice = 0;

  const line_items = cart.cartItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'egp',
      unit_amount: item.price * 100,
      product_data: {
        name: item.product.name,
        images: [item.product.imageCover],
      },
    },
  }));

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: `${cart._id}`,
    metadata: shippingAddress,
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
  });

  res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (stripeSession) => {
  const user = await User.findOne({ email: stripeSession.customer_email });

  const cart = await Cart.findById(stripeSession.client_reference_id).populate({
    path: 'cartItems.product',
    select: 'name imageCover price quantity',
    options: { skipPopulation: true },
  });

  const shippingAddress = stripeSession.metadata;
  const totalPrice = stripeSession.amount_total / 100;

  // Set order items
  const orderItems = cart.cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    imageCover: item.product.imageCover,
    price: item.product.price,
    quantity: item.quantity,
    color: item.color,
  }));

  // Start session and transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Create the order
    await Order.create(
      [
        {
          user: user._id,
          orderItems,
          shippingAddress,
          totalPrice,
          isPaid: true,
          paidAt: Date.now(),
          paymentMethod: 'card',
        },
      ],
      { session },
    );

    // Product `quantity` and `sold` updates
    const writes = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));

    // Update products
    await Product.bulkWrite(writes, { session });

    // Delete user cart
    await Cart.deleteOne({ user: user._id }, { session });

    // Commit transaction
    await session.commitTransaction();

    // res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    await session.abortTransaction();
    // next(new APIError(`Checkout failed: ${err.message}`));
  } finally {
    session.endSession();
  }
};

// @desc    Create cash order
// @route   POST /api/v1/webhook-checkout
// @access  Protected: User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') createCardOrder(event.data.object);

  res.status(200).json({ received: true });
});

// createCashOrder using session.startTransaction() instead of session.withTransaction()
/*
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  // Get current user cart
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select: 'name imageCover price quantity',
    options: { skipPopulation: true },
  });

  if (!cart) {
    return next(new APIError('There is no cart for this user', 404));
  }

  // Check if any product becomes unavailable or a change happened in the stock
  const productsChanged = cart.detectProductQuantityAvailability();
  if (productsChanged.length) {
    return res.status(200).json({
      status: 'warn',
      message: 'Some products are no longer available or are in less than the required quantity.',
      data: { productsChanged },
    });
  }

  // Check if a change in a product price in the cart happened
  const priceChange = cart.detectPriceChange();
  // If there is a change, the cart will be updated with the new price and the order will be cancelled to warn user
  if (priceChange) {
    cart = await cart.save();
    return res.status(200).json({
      status: 'warn',
      message:
        'There are some changes happened to product prices in the cart. Please reconfirm the order',
      data: { cart },
    });
  }

  // Set cart price to the total price after discount if a coupon is applied
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  // Add tax and shipping to total price
  const taxPrice = 0;
  const shippingPrice = 0;
  const totalPrice = cartPrice + taxPrice + shippingPrice;

  // Set order items
  const orderItems = cart.cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    imageCover: item.product.imageCover,
    price: item.product.price,
    quantity: item.quantity,
    color: item.color,
  }));

  // Start session and transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Create the order
    const order = await Order.create(
      [
        {
          user: req.user._id,
          orderItems,
          shippingAddress,
          totalPrice,
        },
      ],
      { session },
    );

    // Product `quantity` and `sold` updates
    const writes = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));

    // Update products
    await Product.bulkWrite(writes, { session });

    // Delete user cart
    await Cart.deleteOne({ user: req.user._id }, { session });

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    await session.abortTransaction();
    next(new APIError(`Checkout failed: ${err.message}`));
  } finally {
    session.endSession();
  }
});
*/
