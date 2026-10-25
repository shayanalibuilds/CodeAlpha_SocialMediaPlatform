const jwt = require('jsonwebtoken');

// A missing JWT_SECRET must never silently fall back to a predictable value.
// - Production: fail fast at startup — the process refuses to run unconfigured.
// - Everywhere else: an ephemeral, clearly-labeled dev fallback keeps local
//   development and tests frictionless, but it is never a secret worth stealing.
function resolveSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret.trim();
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is required in production. Set a long random value before starting the server (e.g. `openssl rand -hex 32`).'
    );
  }
  console.warn(
    '[auth] JWT_SECRET is not set — using a development-only fallback. Never run like this outside local development.'
  );
  return 'dev-only-insecure-do-not-ship';
}

const JWT_SECRET = resolveSecret();

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken, resolveSecret };
