const router = require('express').Router();
const { listPosts, createPost, getPost, deletePost } = require('../controllers/post.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, listPosts);
router.post('/', requireAuth, createPost);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', requireAuth, deletePost);

module.exports = router;
