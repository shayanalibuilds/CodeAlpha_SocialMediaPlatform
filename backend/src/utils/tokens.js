const jwt = require('jsonwebtoken');

// A missing JWT_SECRET must never silently fall back to a value that is public
// in this repo — anyone could forge a token for any user with it (issue #2).
// - Outside the test suite: fail fast. The process refuses to run unconfigured.
// - Test environment only: a clearly-labeled placeholder keeps the suite hermetic.
function resolveSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret.trim();
  if (process.env.NODE_ENV === 'test') return 'test-only-insecure-secret';
  throw new Error(
    'JWT_SECRET is required. Generate a long random value (e.g. `openssl rand -hex 32`) and set it in backend/.env before starting the server.'
  );
}

const JWT_SECRET = resolveSecret();

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken, resolveSecret };
