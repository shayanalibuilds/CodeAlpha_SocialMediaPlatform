// Issue #2: the API must never ship a usable fallback JWT secret.
describe('jwt secret resolution (issue #2)', () => {
  const realEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...realEnv };
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    process.env = realEnv;
  });

  test('refuses to boot in production when JWT_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    // The module resolves the secret at require time — startup fails fast.
    expect(() => require('../src/utils/tokens')).toThrow(
      /JWT_SECRET is required/
    );
  });

  test('outside the test suite it refuses to resolve a secret (development included)', () => {
    process.env.NODE_ENV = 'development';
    expect(() => require('../src/utils/tokens')).toThrow(/JWT_SECRET is required/);
  });

  test('only NODE_ENV=test gets a clearly-labeled placeholder fallback', () => {
    process.env.NODE_ENV = 'test';
    const { resolveSecret } = require('../src/utils/tokens');
    const value = resolveSecret();
    expect(value).toContain('test-only');
    expect(value).not.toBe('dev-insecure-secret');
  });

  test('uses the configured secret when present', () => {
    process.env.JWT_SECRET = 'configured-secret';
    const { resolveSecret } = require('../src/utils/tokens');
    expect(resolveSecret()).toBe('configured-secret');
  });

  test('surrounding whitespace around the configured secret is trimmed', () => {
    process.env.JWT_SECRET = '  padded-secret  ';
    const { resolveSecret } = require('../src/utils/tokens');
    expect(resolveSecret()).toBe('padded-secret');
  });
});
