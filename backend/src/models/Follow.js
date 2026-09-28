const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Two-sided graph edge with one row per (follower, following) pair.
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

module.exports = mongoose.model('Follow', followSchema);
