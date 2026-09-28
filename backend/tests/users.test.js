const request = require('supertest');
const { app, startDB, stopDB, clearDB, registerUser, auth } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

describe('users', () => {
  test('unknown username returns 404', async () => {
    const res = await request(app).get('/api/users/nobody-here');
    expect(res.status).toBe(404);
  });

  test('returns a public profile without the email', async () => {
    await registerUser({ name: 'Jordan Lee', username: 'jordan' });
    const res = await request(app).get('/api/users/jordan');
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('jordan');
    expect(res.body.user.name).toBe('Jordan Lee');
    expect(res.body.user).not.toHaveProperty('email');
  });

  test('requires auth to edit the profile', async () => {
    const res = await request(app).patch('/api/users/me').send({ bio: 'hello' });
    expect(res.status).toBe(401);
  });

  test('updates name, bio, and avatar url', async () => {
    const { token } = await registerUser({ name: 'Riley C', username: 'riley' });

    const res = await request(app).patch('/api/users/me').set(auth(token)).send({
      name: 'Riley Chen',
      bio: 'Art student. Sketchbooks and watercolors.',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Riley Chen');
    expect(res.body.user.bio).toBe('Art student. Sketchbooks and watercolors.');
    expect(res.body.user.avatarUrl).toBe('https://example.com/avatar.png');

    const badUrl = await request(app).patch('/api/users/me').set(auth(token)).send({ avatarUrl: 'not-a-url' });
    expect(badUrl.status).toBe(400);

    const tooLongBio = await request(app)
      .patch('/api/users/me').set(auth(token))
      .send({ bio: 'x'.repeat(201) });
    expect(tooLongBio.status).toBe(400);
  });
});
