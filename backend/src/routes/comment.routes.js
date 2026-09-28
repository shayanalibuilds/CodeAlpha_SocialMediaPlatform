const router = require('express').Router();
const { deleteComment } = require('../controllers/comment.controller');
const { requireAuth } = require('../middleware/auth');

router.delete('/:id', requireAuth, deleteComment);

module.exports = router;
