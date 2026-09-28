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

describe('likes', () => {
  test('liking twice does not raise the count', async () => {
    const { token } = await registerUser({ username: 'liker' });
    const post = await createPost(token, 'double tap test');

    const first = await request(app).post(`/api/posts/${post.id}/like`).set(auth(token));
    expect(first.status).toBe(200);
    expect(first.body).toEqual({ liked: true, likeCount: 1 });

    const second = await request(app).post(`/api/posts/${post.id}/like`).set(auth(token));
    expect(second.status).toBe(200);
    expect(second.body.likeCount).toBe(1); // idempotent — no double count
  });

  test('unlike removes the like and lowers the count; repeating is safe', async () => {
    const { token } = await registerUser({ username: 'liker' });
    const post = await createPost(token, 'toggle test');

    await request(app).post(`/api/posts/${post.id}/like`).set(auth(token));
    const off = await request(app).delete(`/api/posts/${post.id}/like`).set(auth(token));
    expect(off.body).toEqual({ liked: false, likeCount: 0 });

    const again = await request(app).delete(`/api/posts/${post.id}/like`).set(auth(token));
    expect(again.status).toBe(200);
    expect(again.body.likeCount).toBe(0); // never negative
  });

  test('count aggregates across viewers and likedByMe reflects the caller', async () => {
    const a = await registerUser({ username: 'viewerA' });
    const b = await registerUser({ username: 'viewerB' });
    const post = await createPost(a.token, 'who likes this?');

    await request(app).post(`/api/posts/${post.id}/like`).set(auth(a.token));
    await request(app).post(`/api/posts/${post.id}/like`).set(auth(b.token));

    const asA = await request(app).get(`/api/posts/${post.id}`).set(auth(a.token));
    expect(asA.body.post.likeCount).toBe(2);
    expect(asA.body.post.likedByMe).toBe(true);

    const asGuest = await request(app).get(`/api/posts/${post.id}`);
    expect(asGuest.body.post.likeCount).toBe(2);
    expect(asGuest.body.post.likedByMe).toBe(false);
  });

  test('guests cannot like and unknown posts return 404', async () => {
    const { token } = await registerUser();
    const post = await createPost(token, 'guard test');

    const guest = await request(app).post(`/api/posts/${post.id}/like`);
    expect(guest.status).toBe(401);

    const missing = await request(app)
      .post(`/api/posts/${new mongoose.Types.ObjectId()}/like`)
      .set(auth(token));
    expect(missing.status).toBe(404);
  });
});
