import { InterceptorError, addHeaders, prependHost } from './interceptors';

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

describe('the addHeaders() interceptor', () => {
  describe('given an object', () => {
    it('adds the given headers hash to the request', () => {
      const interceptor = addHeaders({ Accept: 'application/json' });
      const result = interceptor({});
      expect(result).toEqual({ headers: { Accept: 'application/json' } });
    });

    it('preserves the rest of the request', () => {
      const interceptor = addHeaders({ Accept: 'application/json' });
      const result = interceptor({ body: 'somebody' });
      expect(result).toEqual({ body: 'somebody', headers: { Accept: 'application/json' } });
    });

    describe('when the request already contains headers', () => {
      it('includes the union of headers', () => {
        const interceptor = addHeaders({ Accept: 'application/json' });
        const result = interceptor({ headers: { Authorization: 'token' } });
        expect(result).toEqual({ headers: { Authorization: 'token', Accept: 'application/json' } });
      });
    });

    describe('when the request contains the same headers passed to addHeaders()', () => {
      it('preserves the request headers', () => {
        const interceptor = addHeaders({ Accept: 'application/json' });
        const result = interceptor({ headers: { Accept: 'text/csv' } });
        expect(result).toEqual({ headers: { Accept: 'text/csv' } });
      });
    });
  });

  describe('when addHeaders() is given a function', () => {
    it('adds the headers returned by the function', () => {
      const interceptor = addHeaders(() => ({ Accept: 'application/json' }));
      const result = interceptor({});
      expect(result).toEqual({ headers: { Accept: 'application/json' } });
    });
  });
});
