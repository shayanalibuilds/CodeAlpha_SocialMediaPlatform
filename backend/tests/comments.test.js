const request = require('supertest');
const mongoose = require('mongoose');
const { app, startDB, stopDB, clearDB, registerUser, auth } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

async function createPost(token, body) {
  const res = await request(app).post('/api/posts').set(auth(token)).send({ body });
  return res.body.post;
}

describe('comments', () => {
  test('guests cannot comment (401)', async () => {
    const { token } = await registerUser();
    const post = await createPost(token, 'say something');
    const res = await request(app).post(`/api/posts/${post.id}/comments`).send({ body: 'hi' });
    expect(res.status).toBe(401);
  });

  test('creates a comment, increments the count, lists oldest first', async () => {
    const a = await registerUser({ username: 'opAuthor' });
    const b = await registerUser({ username: 'replier' });
    const post = await createPost(a.token, 'club fair was great');

    const first = await request(app)
      .post(`/api/posts/${post.id}/comments`).set(auth(a.token))
      .send({ body: 'Which clubs did you join?' });
    expect(first.status).toBe(201);
    expect(first.body.comment.author.username).toBe('opauthor');

    const second = await request(app)
      .post(`/api/posts/${post.id}/comments`).set(auth(b.token))
      .send({ body: 'Coding club and chess club.' });
    expect(second.status).toBe(201);

    const list = await request(app).get(`/api/posts/${post.id}/comments`);
    expect(list.status).toBe(200);
    expect(list.body.comments.map((c) => c.body)).toEqual([
      'Which clubs did you join?',
      'Coding club and chess club.',
    ]);

    const detail = await request(app).get(`/api/posts/${post.id}`);
    expect(detail.body.post.commentCount).toBe(2);
  });

  test('rejects empty and oversized comments', async () => {
    const { token } = await registerUser();
    const post = await createPost(token, 'limits test');

    const empty = await request(app)
      .post(`/api/posts/${post.id}/comments`).set(auth(token))
      .send({ body: '   ' });
    expect(empty.status).toBe(400);

    const tooLong = await request(app)
      .post(`/api/posts/${post.id}/comments`).set(auth(token))
      .send({ body: 'x'.repeat(301) });
    expect(tooLong.status).toBe(400);
  });

  test('only the author can delete a comment; the count stays correct', async () => {
    const author = await registerUser({ username: 'commentAuthor' });
    const stranger = await registerUser({ username: 'commentStranger' });
    const owner = await registerUser({ username: 'postOwner' });
    const post = await createPost(owner.token, 'protect my comments');

    const made = await request(app)
      .post(`/api/posts/${post.id}/comments`).set(auth(author.token))
      .send({ body: 'friendly note' });
    const commentId = made.body.comment.id;

    const strangerDelete = await request(app)
      .delete(`/api/comments/${commentId}`).set(auth(stranger.token));
    expect(strangerDelete.status).toBe(403);

    const authorDelete = await request(app)
      .delete(`/api/comments/${commentId}`).set(auth(author.token));
    expect(authorDelete.status).toBe(200);

    const detail = await request(app).get(`/api/posts/${post.id}`);
    expect(detail.body.post.commentCount).toBe(0);

    const missing = await request(app)
      .post(`/api/posts/${new mongoose.Types.ObjectId()}/comments`).set(auth(author.token))
      .send({ body: 'ghost post' });
    expect(missing.status).toBe(404);
  });
});
