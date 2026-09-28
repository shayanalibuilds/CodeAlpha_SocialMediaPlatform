const User = require('../models/User');
const { validateProfileUpdate } = require('../utils/validate');

async function getProfile(req, res, next) {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toPublic() });
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

module.exports = { getProfile, updateMe };
