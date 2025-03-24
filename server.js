const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });
const createUploadDirectories = require('./utils/createUploadDirectory');
const dbConnection = require('./config/database');
const app = require('./app');

// Create main uploads directory if it doesn't exist with model-specific subdirectories
createUploadDirectories();

// Connect with db
dbConnection();

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

// Handle Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.name} | ${err.message}`);
  console.log('Shutting down...');

  process.exit(1);
});
