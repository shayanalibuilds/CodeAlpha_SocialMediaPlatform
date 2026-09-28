const request = require('supertest');
const { app, startDB, stopDB, clearDB, registerUser, auth } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

describe('auth: register', () => {
  test('creates an account and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alex Rivera',
      username: 'alex',
      email: 'alex@example.com',
      password: 'password-user-12',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe('alex');
    expect(res.body.user.name).toBe('Alex Rivera');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('lowercases usernames and rejects duplicates', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'One', username: 'Case', email: 'one@example.com', password: 'password-user-12',
    });
    const dup = await request(app).post('/api/auth/register').send({
      name: 'Two', username: 'case', email: 'two@example.com', password: 'password-user-12',
    });
    expect(dup.status).toBe(400);
    expect(dup.body.error).toMatch(/username/i);
  });

  test('rejects duplicate emails, short passwords, and invalid usernames', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'A', username: 'alpha', email: 'alpha@example.com', password: 'password-user-12',
    });

    const sameEmail = await request(app).post('/api/auth/register').send({
      name: 'B', username: 'beta', email: 'alpha@example.com', password: 'password-user-12',
    });
    expect(sameEmail.status).toBe(400);

    const shortPassword = await request(app).post('/api/auth/register').send({
      name: 'B', username: 'beta', email: 'beta@example.com', password: 'short',
    });
    expect(shortPassword.status).toBe(400);

    const badUsername = await request(app).post('/api/auth/register').send({
      name: 'B', username: 'has space', email: 'beta@example.com', password: 'password-user-12',
    });
    expect(badUsername.status).toBe(400);
  });
});

describe('auth: login, me, logout', () => {
  test('logs in with email or username', async () => {
    const { payload } = await registerUser({ username: 'jordan', email: 'jordan@example.com' });

    const byEmail = await request(app).post('/api/auth/login').send({
      email: payload.email, password: payload.password,
    });
    expect(byEmail.status).toBe(200);
    expect(byEmail.body.token).toBeTruthy();

    const byUsername = await request(app).post('/api/auth/login').send({
      email: payload.username, password: payload.password,
    });
    expect(byUsername.status).toBe(200);
  });

  test('rejects wrong passwords', async () => {
    const { payload } = await registerUser();
    const res = await request(app).post('/api/auth/login').send({
      email: payload.email, password: 'wrong-password',
    });
    expect(res.status).toBe(401);
  });

  test('me requires a token and returns the current user', async () => {
    const noToken = await request(app).get('/api/auth/me');
    expect(noToken.status).toBe(401);

    const { token, user } = await registerUser();
    const res = await request(app).get('/api/auth/me').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe(user.username);
    expect(res.body.user.email).toBe(user.email);
  });

  test('logout answers ok', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
