const path = require('path');

const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const hpp = require('hpp');

dotenv.config({ path: 'config.env' });
const APIError = require('./utils/apiError');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');
const createUploadDirectories = require('./utils/createUploadDirectory');
const orderController = require('./controllers/orderController');
const sanitizeXss = require('./middlewares/xssMiddleware');
// Routes
const mountRoutes = require('./routes');

// Create main uploads directory if it doesn't exist with model-specific subdirectories
createUploadDirectories();

// Connect with db
dbConnection();

// express app
const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production');

// Middlewares

// Enable CORS
app.use(cors());
app.options('*', cors());

app.use(helmet());

// Apply rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 30 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in half an hour',
  validate: { xForwardedForHeader: false },
});
app.use('/api', limiter);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Stripe checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout,
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'uploads')));

// Data sanitization against NoSQL query injection
app.use(mongoSanitizer());

// Sanitize user input to prevent XSS
app.use(sanitizeXss());

// Prevent http parameter pollution
app.use(hpp({ whitelist: ['ratingsAverage', 'ratingsQuantity', 'price', 'color'] }));

// Compress the response
app.use(compression());

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new APIError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler middleware for express
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;
const server = app.listen(8000, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle Unhandled Rejections outside express
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
  console.log(err.stack);
  server.close(() => {
    console.log('Shutting down...');
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.name} | ${err.message}`);
  console.log('Shutting down...');

  process.exit(1);
});
