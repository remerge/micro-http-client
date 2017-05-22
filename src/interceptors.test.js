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

import { prependHost } from './interceptors';

describe('the prependHost() interceptor', () => {
  it('prepends the host to the request URL', () => {
    const interceptor = prependHost('example.com');
    const result = interceptor({ url: '/foo' });
    expect(result).toEqual({ url: 'example.com/foo' });
  });

  describe('when the host and url both have a slash', () => {
    it('only outputs a single connecting slash', () => {
      const interceptor = prependHost('example.com/');
      const result = interceptor({ url: '/foo' });
      expect(result).toEqual({ url: 'example.com/foo' });
    });
  });

  describe('when neither host nor URL have a slash', () => {
    it('inserts a connecting slash', () => {
      const interceptor = prependHost('example.com');
      const result = interceptor({ url: 'foo' });
      expect(result).toEqual({ url: 'example.com/foo' });
    });
  });
});
