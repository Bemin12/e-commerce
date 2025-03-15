const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
      // get: (val) => `${process.env.BASE_URL}${val}`,
    },
  },
  { timestamps: true },
  // { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
);

module.exports = mongoose.model('Category', categorySchema);
