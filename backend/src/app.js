const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

// Allow the configured client origin plus the usual local dev variants.
const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(
  new Set([...configuredOrigins, 'http://127.0.0.1:5173', 'http://localhost:5173'])
);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'Northwind Park' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Routers for likes, comments, and follows mount here as slices land.

app.use(notFound);
app.use(errorHandler);

module.exports = app;
