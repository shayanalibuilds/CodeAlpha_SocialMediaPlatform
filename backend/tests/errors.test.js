// Issue #5: oversized request bodies must be rejected with 413, not a 500.
const { app, request } = require('./helpers');

describe('error handling (issue #5)', () => {
  test('request bodies over the 100kb limit return 413', async () => {
    const big = 'x'.repeat(150 * 1024);
    const res = await request(app)
      .post('/api/posts')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ body: big }));
    expect(res.status).toBe(413);
    expect(res.body.error).toMatch(/too large/i);
  });

  test('malformed JSON still returns 400', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Content-Type', 'application/json')
      .send('{"broken":');
    expect(res.status).toBe(400);
  });
});
