const router = require('express').Router();
const {
  getProfile,
  updateMe,
  listFollowers,
  listFollowing,
  followUser,
  unfollowUser,
} = require('../controllers/user.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.patch('/me', requireAuth, updateMe);

router.get('/:username', optionalAuth, getProfile);
router.get('/:username/followers', listFollowers);
router.get('/:username/following', listFollowing);
router.post('/:username/follow', requireAuth, followUser);
router.delete('/:username/follow', requireAuth, unfollowUser);

module.exports = router;
