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

  // The profile page refetches its post list after a save; this guards that the
  // API serves the *current* author name/avatar on existing posts and comments.
  test('existing posts and comments show the updated name and avatar after a profile edit', async () => {
    const { token } = await registerUser({ name: 'Sam Old', username: 'sam' });
    const created = await request(app).post('/api/posts').set(auth(token)).send({ body: 'hello park' });
    const postId = created.body.post.id;
    await request(app).post(`/api/posts/${postId}/comments`).set(auth(token)).send({ body: 'first!' });

    const edit = await request(app).patch('/api/users/me').set(auth(token)).send({
      name: 'Sam New',
      avatarUrl: 'https://example.com/sam.png',
    });
    expect(edit.status).toBe(200);

    const byAuthor = await request(app).get('/api/posts?scope=explore&author=sam');
    expect(byAuthor.status).toBe(200);
    expect(byAuthor.body.posts[0].author.name).toBe('Sam New');
    expect(byAuthor.body.posts[0].author.avatarUrl).toBe('https://example.com/sam.png');

    const feed = await request(app).get('/api/posts?scope=feed').set(auth(token));
    expect(feed.body.posts[0].author.name).toBe('Sam New');

    const single = await request(app).get(`/api/posts/${postId}`);
    expect(single.body.post.author.name).toBe('Sam New');

    const comments = await request(app).get(`/api/posts/${postId}/comments`);
    expect(comments.body.comments[0].author.name).toBe('Sam New');
    expect(comments.body.comments[0].author.avatarUrl).toBe('https://example.com/sam.png');
  });
});
