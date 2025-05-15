const express = require('express');
const postController = require('../controllers/post');
const { verify } = require('../auth');

const router = express.Router();

router.post('/addPost', verify, postController.addPost);
router.get('/getPosts', postController.getPosts);
router.get('/getPost/:id', postController.getPost);
router.patch('/updatePost/:id', verify, postController.updatePost);
router.delete('/deletePost/:id', verify, postController.deletePost);

router.post('/addComment/:id', verify, postController.addComment);
router.delete(
  '/deleteComment/:id/:index',
  verify,
  postController.deleteComment
);

module.exports = router;
