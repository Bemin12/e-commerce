const fs = require('fs');
const path = require('path');

module.exports = () => {
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
};
