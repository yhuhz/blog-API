const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is Required'],
  },
  content: {
    type: String,
    required: [true, 'Content is Required'],
  },
  author: {
    type: String,
    required: [true, 'Author is Required'],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  comments: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model('Post', postSchema);
