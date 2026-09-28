const request = require('supertest');
const mongoose = require('mongoose');
const { app, startDB, stopDB, clearDB, registerUser, auth } = require('./helpers');
const User = require('../src/models/User');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('posts: create and read', () => {
  test('guest cannot create a post (401)', async () => {
    const res = await request(app).post('/api/posts').send({ body: 'hello park' });
    expect(res.status).toBe(401);
  });

  test('creates a post with the author taken from the token', async () => {
    const { token, user } = await registerUser({ username: 'alex' });

    const res = await request(app)
      .post('/api/posts')
      .set(auth(token))
      .send({ body: 'Kicked off the social platform build today.' });
    expect(res.status).toBe(201);
    expect(res.body.post.body).toBe('Kicked off the social platform build today.');
    expect(res.body.post.author.username).toBe(user.username);
    expect(res.body.post.likeCount).toBe(0);
    expect(res.body.post.commentCount).toBe(0);
  });

  test('rejects empty bodies, oversized bodies, and bad image urls', async () => {
    const { token } = await registerUser();

    const empty = await request(app).post('/api/posts').set(auth(token)).send({ body: '   ' });
    expect(empty.status).toBe(400);

    const tooLong = await request(app).post('/api/posts').set(auth(token)).send({ body: 'x'.repeat(281) });
    expect(tooLong.status).toBe(400);

    const badUrl = await request(app)
      .post('/api/posts').set(auth(token))
      .send({ body: 'nice art', imageUrl: 'ftp://nope' });
    expect(badUrl.status).toBe(400);
  });

  test('explore lists all posts newest first', async () => {
    const a = await registerUser({ username: 'posterA' });
    const b = await registerUser({ username: 'posterB' });

    await request(app).post('/api/posts').set(auth(a.token)).send({ body: 'first post' });
    await wait(25);
    await request(app).post('/api/posts').set(auth(b.token)).send({ body: 'second post' });
    await wait(25);
    await request(app).post('/api/posts').set(auth(a.token)).send({ body: 'third post' });

    const res = await request(app).get('/api/posts?scope=explore');
    expect(res.status).toBe(200);
    expect(res.body.posts.map((p) => p.body)).toEqual(['third post', 'second post', 'first post']);
    expect(res.body.hasMore).toBe(false);
  });

  test('feed requires login and returns my own posts', async () => {
    const a = await registerUser({ username: 'feeder' });
    await request(app).post('/api/posts').set(auth(a.token)).send({ body: 'just me here' });

    const guest = await request(app).get('/api/posts?scope=feed');
    expect(guest.status).toBe(401);

    const res = await request(app).get('/api/posts?scope=feed').set(auth(a.token));
    expect(res.status).toBe(200);
    expect(res.body.posts.map((p) => p.body)).toEqual(['just me here']);
  });

  test('posts can be filtered by author username', async () => {
    const a = await registerUser({ username: 'authorOne' });
    const b = await registerUser({ username: 'authorTwo' });
    await request(app).post('/api/posts').set(auth(a.token)).send({ body: 'from one' });
    await request(app).post('/api/posts').set(auth(b.token)).send({ body: 'from two' });

    const res = await request(app).get('/api/posts?scope=explore&author=authorOne');
    expect(res.status).toBe(200);
    expect(res.body.posts.map((p) => p.body)).toEqual(['from one']);

    const unknown = await request(app).get('/api/posts?scope=explore&author=ghost');
    expect(unknown.status).toBe(404);
  });

  test('unknown or invalid post ids return 404', async () => {
    const missing = await request(app).get(`/api/posts/${new mongoose.Types.ObjectId()}`);
    expect(missing.status).toBe(404);
    const invalid = await request(app).get('/api/posts/not-an-id');
    expect(invalid.status).toBe(404);
  });
});

describe('posts: delete permissions', () => {
  test('stranger cannot delete my post; the author can', async () => {
    const author = await registerUser({ username: 'author' });
    const stranger = await registerUser({ username: 'stranger' });

    const created = await request(app).post('/api/posts').set(auth(author.token)).send({ body: 'mine' });
    const postId = created.body.post.id;

    const strangerDelete = await request(app).delete(`/api/posts/${postId}`).set(auth(stranger.token));
    expect(strangerDelete.status).toBe(403);

    const authorDelete = await request(app).delete(`/api/posts/${postId}`).set(auth(author.token));
    expect(authorDelete.status).toBe(200);

    const gone = await request(app).get(`/api/posts/${postId}`);
    expect(gone.status).toBe(404);
  });

  test('the admin seed user may delete any post', async () => {
    const owner = await registerUser({ username: 'owner' });
    const admin = await registerUser({ username: 'chief' });
    await User.findByIdAndUpdate(admin.user.id, { role: 'admin' });

    const created = await request(app).post('/api/posts').set(auth(owner.token)).send({ body: 'to moderate' });
    const postId = created.body.post.id;

    const res = await request(app).delete(`/api/posts/${postId}`).set(auth(admin.token));
    expect(res.status).toBe(200);
  });
});
