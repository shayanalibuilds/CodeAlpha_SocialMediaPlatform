const request = require('supertest');
const { app, startDB, stopDB, clearDB, registerUser, auth } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

describe('follow graph', () => {
  test('you cannot follow yourself', async () => {
    const a = await registerUser({ username: 'solo' });
    const res = await request(app).post('/api/users/solo/follow').set(auth(a.token));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/yourself/i);
  });

  test('following someone updates both sides and stays unique', async () => {
    const a = await registerUser({ username: 'followerA' });
    const b = await registerUser({ username: 'followedB' });

    const follow = await request(app).post('/api/users/followedb/follow').set(auth(a.token));
    expect(follow.status).toBe(200);
    expect(follow.body).toEqual({ following: true, followersCount: 1 });

    const repeat = await request(app).post('/api/users/followedb/follow').set(auth(a.token));
    expect(repeat.status).toBe(200);
    expect(repeat.body.followersCount).toBe(1); // unique pair, no duplicate row

    const bProfile = await request(app).get('/api/users/followedb').set(auth(a.token));
    expect(bProfile.body.counts.followers).toBe(1);
    expect(bProfile.body.isFollowing).toBe(true);

    const aProfile = await request(app).get('/api/users/followera');
    expect(aProfile.body.counts.following).toBe(1);

    const lists = await request(app).get('/api/users/followedb/followers');
    expect(lists.body.users.map((u) => u.username)).toEqual(['followera']);
    const following = await request(app).get('/api/users/followera/following');
    expect(following.body.users.map((u) => u.username)).toEqual(['followedb']);
  });

  test('unfollow removes the edge', async () => {
    const a = await registerUser({ username: 'leaver' });
    await registerUser({ username: 'left' });
    await request(app).post('/api/users/left/follow').set(auth(a.token));

    const res = await request(app).delete('/api/users/left/follow').set(auth(a.token));
    expect(res.body).toEqual({ following: false, followersCount: 0 });

    const profile = await request(app).get('/api/users/left');
    expect(profile.body.counts.followers).toBe(0);
  });

  test('unknown usernames return 404 for follow actions and lists', async () => {
    const { token } = await registerUser();

    const follow = await request(app).post('/api/users/ghost/follow').set(auth(token));
    expect(follow.status).toBe(404);

    const unfollow = await request(app).delete('/api/users/ghost/follow').set(auth(token));
    expect(unfollow.status).toBe(404);

    const followers = await request(app).get('/api/users/ghost/followers');
    expect(followers.status).toBe(404);

    const following = await request(app).get('/api/users/ghost/following');
    expect(following.status).toBe(404);
  });

  test('feed shows my posts plus people I follow, not strangers', async () => {
    const me = await registerUser({ username: 'meUser' });
    const friend = await registerUser({ username: 'friendUser' });
    const stranger = await registerUser({ username: 'strangerUser' });

    await request(app).post('/api/users/frienduser/follow').set(auth(me.token));

    await request(app).post('/api/posts').set(auth(me.token)).send({ body: 'my own post' });
    await request(app).post('/api/posts').set(auth(friend.token)).send({ body: 'friend post' });
    await request(app).post('/api/posts').set(auth(stranger.token)).send({ body: 'stranger post' });

    const res = await request(app).get('/api/posts?scope=feed').set(auth(me.token));
    expect(res.status).toBe(200);
    const bodies = res.body.posts.map((post) => post.body);
    expect(bodies).toContain('my own post');
    expect(bodies).toContain('friend post');
    expect(bodies).not.toContain('stranger post');
  });

  test('follow actions require login', async () => {
    await registerUser({ username: 'target' });
    const res = await request(app).post('/api/users/target/follow');
    expect(res.status).toBe(401);
  });
});
