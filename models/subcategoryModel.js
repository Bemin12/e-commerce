const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Too short subcategory name'],
      maxlength: [32, 'Too long subcategory name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Subcategory must belong to parent category'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Subcategory', subcategorySchema);
