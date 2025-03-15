const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },
  phone: String,
  profileImg: {
    type: String,
    default:
      'https://res.cloudinary.com/dxbiecqpq/image/upload/v1718013705/rzjkgteqrnkfxiwo6acx.png',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Too short password'],
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetCode: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  verified: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > JWTTimestamps;
  }

  return false;
};

/*
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return token;
};
*/

userSchema.methods.createPasswordResetCode = function () {
  const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  this.passwordResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetCode;
};

userSchema.methods.createVerificationCode = function () {
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  this.verificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

  return verificationCode;
};

module.exports = mongoose.model('User', userSchema);
