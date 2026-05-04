// This file defines the User model for authentication and user management
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // User's email (unique for login)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password will be hashed before saving to database
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    // This adds createdAt and updatedAt timestamps automatically
    timestamps: true,
  }
);

// Before saving a user, hash the password if it's new or changed
userSchema.pre('save', async function (next) {
  // Skip hashing if password hasn't been changed
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt for hashing (higher rounds = more secure but slower)
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// This method compares entered password with stored hashed password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hide password from response when user object is returned as JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
