import { InterceptorError, prependHost } from './interceptors';

describe('the prependHost() interceptor', () => {
  it('prepends the host to the request URL', () => {
    const interceptor = prependHost('example.com');
    const result = interceptor({ url: '/foo' });
    expect(result).toEqual({ url: 'example.com/foo' });
  });

  it('requires an absolute path', () => {
    const interceptor = prependHost('example.com');
    const request = { url: './relative' };
    expect(() => interceptor(request)).toThrow(/requires an absolute path/);
    expect(() => interceptor(request)).toThrow(InterceptorError);
  });

  it('preserves the rest of the request', () => {
    const interceptor = prependHost('example.com');
    const result = interceptor({ url: '/foo', headers: { Accept: 'application/json' } });
    expect(result).toEqual({ url: 'example.com/foo', headers: { Accept: 'application/json' } });
  });

  describe('when the host has a trailing slash', () => {
    it('only outputs a single connecting slash', () => {
      const interceptor = prependHost('example.com/');
      const result = interceptor({ url: '/foo' });
      expect(result).toEqual({ url: 'example.com/foo' });
    });
  });
});
