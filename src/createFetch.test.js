import createFetch from './createFetch';

(function mockGlobalFetch() {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve());
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });
}());

describe('createFetch', () => {
  it('calls `fetch`', async () => {
    const newFetch = createFetch({});
    const url = 'some/url';
    const requestObject = { foo: 'bar' };
    await newFetch(url, requestObject);
    expect(global.fetch).toHaveBeenCalledWith(url, { url, foo: 'bar' });
  });

  it('invokes request interceptors with the request object', async () => {
    const interceptor = jest.fn(() => ({}));
    const newFetch = createFetch({ requestInterceptors: [interceptor] });
    const url = 'some/url';
    await newFetch(url, { body: 'some body' });
    expect(interceptor).toHaveBeenCalledWith({ url, body: 'some body' });
  });

  it('waits for an asynchronous request interceptor', async () => {
    const mockRequest = { url: 'mockUrl', foo: 'bar' };
    const interceptor = jest.fn(() => Promise.resolve(mockRequest));

    const newFetch = createFetch({ requestInterceptors: [interceptor] });
    await newFetch();
    expect(global.fetch).toHaveBeenCalledWith(mockRequest.url, mockRequest);
  });

  it('calls `fetch` with the output of the interceptors', async () => {
    const interceptorResult = { method: 'POST', url: 'somewhere.com' };
    const interceptor = () => interceptorResult;
    const newFetch = createFetch({ requestInterceptors: [interceptor] });
    await newFetch();
    expect(global.fetch).toHaveBeenCalledWith(interceptorResult.url, interceptorResult);
  });

  describe('with multiple request interceptors', () => {
    it('passes the result of the first interceptor to the second interceptor', async () => {
      const firstInterceptorResult = { foo: 'bar' };
      const firstInterceptor = jest.fn(() => firstInterceptorResult);
      const secondInterceptor = jest.fn(() => ({}));
      const newFetch = createFetch({
        requestInterceptors: [firstInterceptor, secondInterceptor],
      });
      await newFetch('someUrl');
      expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
    });
  });

  describe('with multiple asynchronous request interceptors', () => {
    it('passes the result of the first interceptor to the second interceptor', async () => {
      const firstInterceptorResult = { foo: 'bar' };
      const firstInterceptor = jest.fn(() => Promise.resolve(firstInterceptorResult));
      const secondInterceptor = jest.fn(() => Promise.resolve({}));
      const newFetch = createFetch({
        requestInterceptors: [firstInterceptor, secondInterceptor],
      });
      await newFetch('someUrl');
      expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
    });
  });

  describe('when a request interceptor throws an error', () => {
    it('is immediately raised', async () => {
      const interceptorError = new Error();
      const interceptor = () => {
        throw interceptorError;
      };
      const newFetch = createFetch({ requestInterceptors: [interceptor] });
      await expect(newFetch()).rejects.toBe(interceptorError);
    });
  });

  describe('when the fetch() resolves', () => {
    it('invokes the response interceptors with the Response', async () => {
      const mockResponse = { foo: 'bar' };
      global.fetch = jest.fn(() => Promise.resolve(mockResponse));

      const interceptor = jest.fn(() => ({}));
      const newFetch = createFetch({ responseInterceptors: [interceptor] });

      await newFetch();
      expect(interceptor).toHaveBeenCalledWith(mockResponse);
    });

    it('returns a Promise that resolves with the return value of the interceptor', async () => {
      const mockResult = { foo: 'bar' };
      const interceptor = jest.fn(() => mockResult);
      const newFetch = createFetch({ responseInterceptors: [interceptor] });

      const result = await newFetch();
      expect(result).toBe(mockResult);
    });

    it('waits for an asynchronous response interceptor', async () => {
      const mockResult = { foo: 'bar' };
      const interceptor = jest.fn(() => Promise.resolve(mockResult));

      const newFetch = createFetch({ responseInterceptors: [interceptor] });

      const result = await newFetch();
      expect(result).toBe(mockResult);
    });

    describe('and there are multiple response interceptors', () => {
      it('invokes the second response interceptor with the result of the first', async () => {
        const firstInterceptorResult = { foo: 'bar' };
        const firstInterceptor = jest.fn(() => firstInterceptorResult);
        const secondInterceptor = jest.fn(() => ({}));

        const newFetch = createFetch({
          responseInterceptors: [firstInterceptor, secondInterceptor],
        });

        await newFetch();
        expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
      });
    });

    describe('and there are multiple asynchronous response interceptors', () => {
      it('invokes the second response interceptor with the result of the first', async () => {
        const firstInterceptorResult = { foo: 'bar' };
        const firstInterceptor = jest.fn(() => Promise.resolve(firstInterceptorResult));
        const secondInterceptor = jest.fn(() => {});

        const newFetch = createFetch({
          responseInterceptors: [firstInterceptor, secondInterceptor],
        });

        await newFetch();
        expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
      });
    });
  });

  describe('when a response interceptor throws an error', () => {
    it('is immediately raised', async () => {
      const interceptorError = new Error();
      const interceptor = () => {
        throw interceptorError;
      };
      const newFetch = createFetch({ responseInterceptors: [interceptor] });
      await expect(newFetch()).rejects.toBe(interceptorError);
    });
  });
});
