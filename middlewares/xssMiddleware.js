const xss = require('xss');

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') obj[key] = xss(value);
    else if (Array.isArray(value)) {
      obj[key] = value.map((item) => (typeof item === 'string' ? xss(item) : sanitizeObject(item)));
    } else if (typeof value === 'object') {
      obj[key] = sanitizeObject(value);
    }
  });

  return obj;
};

const sanitizeMiddleware = () => (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.params) req.params = sanitizeObject(req.params);
  if (req.query) req.query = sanitizeObject(req.query);

  next();
};

module.exports = sanitizeMiddleware;
