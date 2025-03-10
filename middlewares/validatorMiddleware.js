const { validationResult } = require('express-validator');
// @desc Finds the validation errors in this request and wraps them in an object with handy functions
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({
        status: 'failed',
        errors: errors
          .array()
          .map((error) => ({ field: error.path, message: error.msg })),
      });
  }

  next();
};
