const router = require('express').Router();
const { register, login, me, logout } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

module.exports = router;
