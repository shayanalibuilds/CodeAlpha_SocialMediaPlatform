const router = require('express').Router();
const {
  listPosts,
  createPost,
  getPost,
  deletePost,
  likePost,
  unlikePost,
} = require('../controllers/post.controller');
const { listComments, createComment } = require('../controllers/comment.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, listPosts);
router.post('/', requireAuth, createPost);

router.get('/:id', optionalAuth, getPost);
router.delete('/:id', requireAuth, deletePost);

router.post('/:id/like', requireAuth, likePost);
router.delete('/:id/like', requireAuth, unlikePost);

router.get('/:id/comments', listComments);
router.post('/:id/comments', requireAuth, createComment);

module.exports = router;
