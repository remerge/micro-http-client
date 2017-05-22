/*

prependHost()

  - takes a host string as input
  - returns a function (interceptor), which:
    - takes a request (object) as input
    - gives a request as output
    - prepends the given host string to the request's URL
    - doesn't generate "//"
    - doesn't modify the URL if it includes a host already

*/

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

  describe('when the host has a trailing slash', () => {
    it('only outputs a single connecting slash', () => {
      const interceptor = prependHost('example.com/');
      const result = interceptor({ url: '/foo' });
      expect(result).toEqual({ url: 'example.com/foo' });
    });
  });
});
