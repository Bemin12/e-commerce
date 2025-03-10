const multer = require('multer');
const APIError = require('../utils/apiError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new APIError('Uploaded file is not an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) => upload.fields(arrayOfFields);
