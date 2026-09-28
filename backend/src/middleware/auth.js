const User = require('../models/User');
const { verifyToken } = require('../utils/tokens');

function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

async function loadUserFromToken(token) {
  const payload = verifyToken(token);
  return User.findById(payload.id).select('_id name username role avatarUrl');
}

async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Please log in to continue.' });
    let user;
    try {
      user = await loadUserFromToken(token);
    } catch {
      return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    req.user = null;
    const token = extractToken(req);
    if (token) {
      try {
        req.user = await loadUserFromToken(token);
      } catch {
        req.user = null;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, optionalAuth };
