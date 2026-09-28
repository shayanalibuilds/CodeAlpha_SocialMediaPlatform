const router = require('express').Router();
const { getProfile, updateMe } = require('../controllers/user.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.patch('/me', requireAuth, updateMe);
router.get('/:username', optionalAuth, getProfile);

module.exports = router;
