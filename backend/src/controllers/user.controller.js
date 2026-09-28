const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { validateProfileUpdate } = require('../utils/validate');
const { publicAuthor } = require('../utils/serialize');

async function getProfile(req, res, next) {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const [posts, followers, following] = await Promise.all([
      Post.countDocuments({ author: user._id }),
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
    ]);

    let isFollowing = false;
    if (req.user) {
      isFollowing = Boolean(
        await Follow.exists({ follower: req.user._id, following: user._id })
      );
    }

    res.json({
      user: user.toPublic(),
      counts: { posts, followers, following },
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { errors, values } = validateProfileUpdate(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const user = await User.findByIdAndUpdate(req.user._id, values, {
      new: true,
      runValidators: true,
      context: 'query',
    });
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    res.json({ user: user.toPrivate() });
  } catch (err) {
    next(err);
  }
}

async function listFollowers(req, res, next) {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User.findOne({ username }).select('_id');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const docs = await Follow.find({ following: user._id })
      .sort({ createdAt: -1 })
      .populate('follower', 'name username bio avatarUrl');
    res.json({ users: docs.map((doc) => publicAuthor(doc.follower)) });
  } catch (err) {
    next(err);
  }
}

async function listFollowing(req, res, next) {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User.findOne({ username }).select('_id');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const docs = await Follow.find({ follower: user._id })
      .sort({ createdAt: -1 })
      .populate('following', 'name username bio avatarUrl');
    res.json({ users: docs.map((doc) => publicAuthor(doc.following)) });
  } catch (err) {
    next(err);
  }
}

async function followUser(req, res, next) {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const target = await User.findOne({ username }).select('_id');
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    try {
      await Follow.create({ follower: req.user._id, following: target._id });
    } catch (err) {
      if (err.code !== 11000) throw err; // already following — idempotent
    }

    const followersCount = await Follow.countDocuments({ following: target._id });
    res.json({ following: true, followersCount });
  } catch (err) {
    next(err);
  }
}

async function unfollowUser(req, res, next) {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const target = await User.findOne({ username }).select('_id');
    if (!target) return res.status(404).json({ error: 'User not found.' });

    await Follow.deleteOne({ follower: req.user._id, following: target._id });
    const followersCount = await Follow.countDocuments({ following: target._id });
    res.json({ following: false, followersCount });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateMe,
  listFollowers,
  listFollowing,
  followUser,
  unfollowUser,
};
