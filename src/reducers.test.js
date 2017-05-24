import { ReducerError, addHeaders, prependHost, processBody, rejectIfUnsuccessful } from './reducers';

describe('the prependHost() reducer', () => {
  it('prepends the host to the request URL', () => {
    const reducer = prependHost('example.com');
    const result = reducer({ url: '/foo' });
    expect(result).toEqual({ url: 'example.com/foo' });
  });

  it('requires an absolute path', () => {
    const reducer = prependHost('example.com');
    const request = { url: './relative' };
    expect(() => reducer(request)).toThrow(new ReducerError('prependHost() requires an absolute path', { request }));
  });

  it('preserves the rest of the request', () => {
    const reducer = prependHost('example.com');
    const result = reducer({ url: '/foo', headers: { Accept: 'application/json' } });
    expect(result).toEqual({ url: 'example.com/foo', headers: { Accept: 'application/json' } });
  });

  describe('when the host has a trailing slash', () => {
    it('only outputs a single connecting slash', () => {
      const reducer = prependHost('example.com/');
      const result = reducer({ url: '/foo' });
      expect(result).toEqual({ url: 'example.com/foo' });
    });
  });
});

describe('the addHeaders() reducer', () => {
  describe('given an object', () => {
    it('adds the given headers hash to the request', async () => {
      const reducer = addHeaders({ Accept: 'application/json' });
      const result = await reducer({});
      expect(result).toEqual({ headers: { Accept: 'application/json' } });
    });

    it('preserves the rest of the request', async () => {
      const reducer = addHeaders({ Accept: 'application/json' });
      const result = await reducer({ body: 'somebody' });
      expect(result).toEqual({ body: 'somebody', headers: { Accept: 'application/json' } });
    });

    describe('when the request already contains headers', () => {
      it('includes the union of headers', async () => {
        const reducer = addHeaders({ Accept: 'application/json' });
        const result = await reducer({ headers: { Authorization: 'token' } });
        expect(result).toEqual({ headers: { Authorization: 'token', Accept: 'application/json' } });
      });
    });

    describe('when the request contains the same headers passed to addHeaders()', () => {
      it('preserves the request headers', async () => {
        const reducer = addHeaders({ Accept: 'application/json' });
        const result = await reducer({ headers: { Accept: 'text/csv' } });
        expect(result).toEqual({ headers: { Accept: 'text/csv' } });
      });
    });
  });

  describe('when addHeaders() is given a function', () => {
    it('adds the headers returned by the function', async () => {
      const reducer = addHeaders(() => ({ Accept: 'application/json' }));
      const result = await reducer({});
      expect(result).toEqual({ headers: { Accept: 'application/json' } });
    });

    describe('which is asynchronous', () => {
      it('adds the headers returned by the function', async () => {
        const reducer = addHeaders(() => Promise.resolve({ Accept: 'application/json' }));
        const result = await reducer({});
        expect(result).toEqual({ headers: { Accept: 'application/json' } });
      });
    });
  });
});

describe('the processBody() reducer', () => {
  describe('when the request has a body', () => {
    it('calls the given function with the request body', async () => {
      const originalBody = 'foobar';
      const processorFunction = jest.fn();
      const reducer = processBody(processorFunction);
      await reducer({ body: originalBody });
      expect(processorFunction).toHaveBeenCalledWith(originalBody);
    });

    it('replaces the request body with the result of the given function', async () => {
      const processedBody = 'bazboz';
      const reducer = processBody(() => processedBody);
      const result = await reducer({ body: 'foobar' });
      expect(result.body).toBe(processedBody);
    });

    it('preserves the rest of the request', async () => {
      const reducer = processBody(() => {});
      const result = await reducer({ body: 'somebody', headers: { Accept: 'application/json' } });
      expect(result).toEqual({ body: undefined, headers: { Accept: 'application/json' } });
    });

    describe('and the given function is asynchronous', () => {
      it('waits for the processor function to complete', async () => {
        const processedBody = 'bazboz';
        const reducer = processBody(() => Promise.resolve(processedBody));
        const result = await reducer({ body: 'foobar' });
        expect(result.body).toBe(processedBody);
      });
    });
  });

  describe('when the request has no body', () => {
    it('does not add a body to the request', async () => {
      const reducer = processBody(() => ({}));
      const result = await reducer({ url: 'example.com' });
      expect(result).not.toHaveProperty('body');
    });
  });
});

describe('the rejectIfUnsuccessful() reducer', () => {
  describe('when the response is successful', () => {
    it('returns the response', () => {
      const response = { status: 200 };
      expect(rejectIfUnsuccessful(response)).toBe(response);
    });
  });

  describe('when the response is not successful', () => {
    it('throws an ReducerError', () => {
      const response = { status: 400 };
      expect(() => rejectIfUnsuccessful(response)).toThrow(
        new ReducerError('Response is not successful', { response }),
      );
    });
  });
});
