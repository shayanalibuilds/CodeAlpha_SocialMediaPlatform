const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/tokens');
const { validateRegister, EMAIL_RE } = require('../utils/validate');

async function register(req, res, next) {
  try {
    const { errors, values } = validateRegister(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const existing = await User.findOne({ $or: [{ username: values.username }, { email: values.email }] }).select('username email');
    if (existing) {
      if (existing.username === values.username) {
        return res.status(400).json({ error: 'That username is already taken. Try another.' });
      }
      return res.status(400).json({ error: 'That email is already registered. Try logging in.' });
    }

    const passwordHash = await bcrypt.hash(values.password, 10);
    const user = await User.create({
      name: values.name,
      username: values.username,
      email: values.email,
      passwordHash,
    });

    res.status(201).json({ token: signToken(user), user: user.toPrivate() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const body = req.body || {};
    const identifier = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your email (or username) and password.' });
    }

    const isEmail = EMAIL_RE.test(identifier);
    const user = await User.findOne(isEmail ? { email: identifier } : { username: identifier });
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Incorrect email or password.' });

    res.json({ token: signToken(user), user: user.toPrivate() });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    res.json({ user: user.toPrivate() });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.json({ ok: true, message: 'Logged out. The client removes its token.' });
}

module.exports = { register, login, me, logout };
