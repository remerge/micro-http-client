import { InterceptorError, addHeaders, prependHost, processBody } from './interceptors';

describe('the prependHost() interceptor', () => {
  it('prepends the host to the request URL', () => {
    const interceptor = prependHost('example.com');
    const result = interceptor({ url: '/foo' });
    expect(result).toEqual({ url: 'example.com/foo' });
  });

  it('requires an absolute path', () => {
    const interceptor = prependHost('example.com');
    const request = { url: './relative' };
    expect(() => interceptor(request)).toThrow(
      new InterceptorError('prependHost() requires an absolute path', { request }),
    );
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
    it('adds the given headers hash to the request', async () => {
      const interceptor = addHeaders({ Accept: 'application/json' });
      const result = await interceptor({});
      expect(result).toEqual({ headers: { Accept: 'application/json' } });
    });

    it('preserves the rest of the request', async () => {
      const interceptor = addHeaders({ Accept: 'application/json' });
      const result = await interceptor({ body: 'somebody' });
      expect(result).toEqual({ body: 'somebody', headers: { Accept: 'application/json' } });
    });

    describe('when the request already contains headers', () => {
      it('includes the union of headers', async () => {
        const interceptor = addHeaders({ Accept: 'application/json' });
        const result = await interceptor({ headers: { Authorization: 'token' } });
        expect(result).toEqual({ headers: { Authorization: 'token', Accept: 'application/json' } });
      });
    });

    describe('when the request contains the same headers passed to addHeaders()', () => {
      it('preserves the request headers', async () => {
        const interceptor = addHeaders({ Accept: 'application/json' });
        const result = await interceptor({ headers: { Accept: 'text/csv' } });
        expect(result).toEqual({ headers: { Accept: 'text/csv' } });
      });
    });
  });

  describe('when addHeaders() is given a function', () => {
    it('adds the headers returned by the function', async () => {
      const interceptor = addHeaders(() => ({ Accept: 'application/json' }));
      const result = await interceptor({});
      expect(result).toEqual({ headers: { Accept: 'application/json' } });
    });

    describe('which is asynchronous', () => {
      it('adds the headers returned by the function', async () => {
        const interceptor = addHeaders(() => Promise.resolve({ Accept: 'application/json' }));
        const result = await interceptor({});
        expect(result).toEqual({ headers: { Accept: 'application/json' } });
      });
    });
  });
});

describe('the processBody() interceptor', () => {
  describe('when the request has a body', () => {
    it('calls the given function with the request body', async () => {
      const originalBody = 'foobar';
      const processorFunction = jest.fn();
      const interceptor = processBody(processorFunction);
      await interceptor({ body: originalBody });
      expect(processorFunction).toHaveBeenCalledWith(originalBody);
    });

    it('replaces the request body with the result of the given function', async () => {
      const processedBody = 'bazboz';
      const interceptor = processBody(() => processedBody);
      const result = await interceptor({ body: 'foobar' });
      expect(result.body).toBe(processedBody);
    });

    it('preserves the rest of the request', async () => {
      const interceptor = processBody(() => {});
      const result = await interceptor({ body: 'somebody', headers: { Accept: 'application/json' } });
      expect(result).toEqual({ body: undefined, headers: { Accept: 'application/json' } });
    });

    describe('and the given function is asynchronous', () => {
      it('waits for the processor function to complete', async () => {
        const processedBody = 'bazboz';
        const interceptor = processBody(() => Promise.resolve(processedBody));
        const result = await interceptor({ body: 'foobar' });
        expect(result.body).toBe(processedBody);
      });
    });
  });

  describe('when the request has no body', () => {
    it('does not add a body to the request', async () => {
      const interceptor = processBody(() => ({}));
      const result = await interceptor({ url: 'example.com' });
      expect(result).not.toHaveProperty('body');
    });
  });
});
