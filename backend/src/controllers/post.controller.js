const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const { validatePost } = require('../utils/validate');
const { publicPost } = require('../utils/serialize');

const PAGE_SIZE = 20;

function parsePage(raw) {
  const page = parseInt(raw, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

async function listPosts(req, res, next) {
  try {
    const scope = req.query.scope === 'feed' ? 'feed' : 'explore';
    const page = parsePage(req.query.page);
    const filter = {};

    if (scope === 'feed') {
      if (!req.user) return res.status(401).json({ error: 'Please log in to see your feed.' });
      // Own posts for now; followed authors join in the follow-graph slice.
      filter.author = { $in: [req.user._id] };
    }

    if (req.query.author) {
      const username = String(req.query.author).toLowerCase();
      const author = await User.findOne({ username }).select('_id');
      if (!author) return res.status(404).json({ error: 'User not found.' });
      filter.author = author._id;
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('author');

    res.json({
      posts: posts.map(publicPost),
      page,
      total,
      hasMore: page * PAGE_SIZE < total,
    });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { errors, values } = validatePost(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const post = await Post.create({
      author: req.user._id,
      body: values.body,
      imageUrl: values.imageUrl,
    });
    await post.populate('author');
    res.status(201).json({ post: publicPost(post) });
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Post not found.' });
    const post = await Post.findById(id).populate('author');
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: publicPost(post) });
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Post not found.' });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const isAuthor = String(post.author) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Only the author can delete this post.' });
    }

    await post.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPosts, createPost, getPost, deletePost };
