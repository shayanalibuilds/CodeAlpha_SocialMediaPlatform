// Issue #5: oversized request bodies must be rejected with 413, not a 500.
const { app, request } = require('./helpers');
const { errorHandler } = require('../src/middleware/errors');

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

  test('client errors that already carry a 4xx status keep it', () => {
    const res = {
      code: 0,
      body: null,
      status(code) {
        this.code = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };
    const err = Object.assign(new Error('Nope.'), { status: 418 });
    errorHandler(err, {}, res, () => {});
    expect(res.code).toBe(418);
    expect(res.body).toEqual({ error: 'Nope.' });
  });

  test('errors without a client status still become a 500', () => {
    const res = {
      code: 0,
      body: null,
      status(code) {
        this.code = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };
    errorHandler(new Error('boom'), {}, res, () => {});
    expect(res.code).toBe(500);
  });
});
