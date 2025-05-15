const Post = require('../models/Post');
const User = require('../models/User');
const { errorHandler } = require('../auth');

module.exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).lean(); // .lean() improves performance

    const userIds = posts.map((post) => post.author); // Extract author IDs

    const users = await User.find({ _id: { $in: userIds } }).select(
      '_id username'
    );

    // Create a mapping of userId -> username
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.username])
    );

    // Attach authorName to each post
    const updatedPosts = posts.map((post) => ({
      ...post,
      authorName: userMap.get(post.author.toString()) || 'Unknown',
    }));

    res.status(200).send({
      success: true,
      posts: updatedPosts,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

module.exports.addPost = (req, res) => {
  let newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.user.id,
  });

  return newPost
    .save()
    .then((result) => res.status(201).send(result))
    .catch((err) => errorHandler(err, req, res));
};

module.exports.updatePost = (req, res) => {
  let updatedPost = {
    title: req.body.title,
    content: req.body.content,
  };

  return Post.findByIdAndUpdate(req.params.id, updatedPost, { new: true })
    .then((post) => {
      if (post) {
        res.status(200).send({
          success: true,
          message: 'Post updated successfully',
          updatedPost: post,
        });
      } else {
        res.status(404).send({
          message: 'Post not found',
        });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.deletePost = (req, res) => {
  return Post.findByIdAndDelete(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).send({
          success: true,
          message: 'Post deleted successfully',
        });
      } else {
        res.status(404).send({
          message: 'Post not found',
        });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getPost = async (req, res) => {
  try {
    // Retrieve the post with comments
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res
        .status(404)
        .send({ success: false, message: 'Post not found' });
    }

    // Find the post author
    const user = await User.findById(post.author).select('username');

    // Retrieve usernames for each comment's userId
    const commentsWithUsernames = await Promise.all(
      post.comments.map(async (comment) => {
        const commentUser = await User.findById(comment.userId).select(
          'username'
        );
        return {
          ...comment,
          username: commentUser ? commentUser.username : 'Unknown',
        };
      })
    );

    res.status(200).send({
      success: true,
      post: {
        ...post,
        authorName: user ? user.username : 'Unknown',
        comments: commentsWithUsernames, // Update comments with usernames
      },
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

module.exports.addComment = (req, res) => {
  return Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { userId: req.user.id, comment: req.body.comment } } },
    { new: true }
  )
    .then((post) => {
      if (post) {
        res.status(200).send({
          success: true,
          message: 'Comment added successfully',
          updatedPost: post,
        });
      } else {
        res.status(404).send({
          message: 'Post not found',
        });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    const index = parseInt(req.params.index, 10); // Ensure index is a number

    if (index < 0 || index >= post.comments.length) {
      return res.status(400).send({ message: 'Invalid comment index' });
    }

    post.comments.splice(index, 1); // Remove comment by index

    await post.save(); // Save updated post

    res.status(200).send({
      success: true,
      message: 'Comment deleted successfully',
      updatedPost: post,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};
