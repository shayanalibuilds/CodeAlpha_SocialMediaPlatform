const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { validateComment } = require('../utils/validate');
const { publicComment } = require('../utils/serialize');

async function listComments(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Post not found.' });
    const exists = await Post.exists({ _id: id });
    if (!exists) return res.status(404).json({ error: 'Post not found.' });

    const comments = await Comment.find({ post: id })
      .sort({ createdAt: 1 })
      .populate('author');
    res.json({ comments: comments.map(publicComment) });
  } catch (err) {
    next(err);
  }
}

async function createComment(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Post not found.' });
    const post = await Post.findById(id).select('_id');
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const { errors, values } = validateComment(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const comment = await Comment.create({
      author: req.user._id,
      post: post._id,
      body: values.body,
    });
    await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
    await comment.populate('author');
    res.status(201).json({ comment: publicComment(comment) });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Comment not found.' });
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (String(comment.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Only the author can delete this comment.' });
    }

    await comment.deleteOne();
    await Post.updateOne(
      { _id: comment.post, commentCount: { $gt: 0 } },
      { $inc: { commentCount: -1 } }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listComments, createComment, deleteComment };
