const jwt = require('jsonwebtoken');

function secret() {
  return process.env.JWT_SECRET || 'dev-insecure-secret';
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, secret(), { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, secret());
}

module.exports = { signToken, verifyToken };
