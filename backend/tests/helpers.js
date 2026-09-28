process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://127.0.0.1:5173';

const { execSync } = require('child_process');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');

let mongod = null;

function systemMongodPath() {
  const candidates = ['/usr/bin/mongod', '/usr/local/bin/mongod', '/opt/homebrew/bin/mongod'];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  try {
    return execSync('command -v mongod', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
}

async function startDB() {
  const binary = systemMongodPath();
  if (binary) process.env.MONGOMS_SYSTEM_BINARY = binary;
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri('northwind_park_test'));
}

async function stopDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}

async function clearDB() {
  const { collections } = mongoose.connection;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

async function registerUser(overrides = {}) {
  const suffix = Math.random().toString(36).slice(2, 8);
  const payload = {
    name: 'Test User',
    username: `user${suffix}`,
    email: `${suffix}@example.com`,
    password: 'password-user-12',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { user: res.body.user, token: res.body.token, payload };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { app, request, startDB, stopDB, clearDB, registerUser, auth };
