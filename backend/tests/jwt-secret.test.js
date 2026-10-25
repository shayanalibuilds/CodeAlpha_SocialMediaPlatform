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
      /JWT_SECRET is required in production/
    );
  });

  test('outside production the fallback is clearly a non-shippable dev value', () => {
    process.env.NODE_ENV = 'development';
    const { resolveSecret } = require('../src/utils/tokens');
    const value = resolveSecret();
    expect(value).toContain('dev-only');
    expect(value).not.toBe('dev-insecure-secret');
  });

  test('uses the configured secret when present', () => {
    process.env.JWT_SECRET = 'configured-secret';
    const { resolveSecret } = require('../src/utils/tokens');
    expect(resolveSecret()).toBe('configured-secret');
  });
});
