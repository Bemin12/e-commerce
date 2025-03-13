const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

dotenv.config({ path: 'config.env' });
const APIError = require('./utils/apiError');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');

const categoryRouter = require('./routes/categoryRoutes');
const subcategoryRouter = require('./routes/subcategoryRoutes');
const brandRouter = require('./routes/brandRoutes');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');

// Connect with db
dbConnection();

// express app
const app = express();

// Create main uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Create model-specific subdirectories
const modelDirs = ['categories', 'brands', 'products'];
modelDirs.forEach((dir) => {
  const modelDir = path.join(uploadDir, dir);
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir);
  }
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routes
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subcategoryRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

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
  console.log(`Uhandled Rejection Error: ${err.name} | ${err.message}`);
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
