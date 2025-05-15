const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is Required'],
  },
  username: {
    type: String,
    required: [true, 'Username is Required'],
  },
  password: {
    type: String,
    required: [true, 'Password is Required'],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);
