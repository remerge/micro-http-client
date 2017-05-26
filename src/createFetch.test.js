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

  it('invokes request reducers with the request object', async () => {
    const reducer = jest.fn(() => ({}));
    const newFetch = createFetch({ requestReducers: [reducer] });
    const url = 'some/url';
    await newFetch(url, { body: 'some body' });
    expect(reducer).toHaveBeenCalledWith({ url, body: 'some body' });
  });

  it('waits for an asynchronous request reducer', async () => {
    const mockRequest = { url: 'mockUrl', foo: 'bar' };
    const reducer = jest.fn(() => Promise.resolve(mockRequest));

    const newFetch = createFetch({ requestReducers: [reducer] });
    await newFetch();
    expect(global.fetch).toHaveBeenCalledWith(mockRequest.url, mockRequest);
  });

  it('calls `fetch` with the output of the reducers', async () => {
    const reducerResult = { method: 'POST', url: 'somewhere.com' };
    const reducer = () => reducerResult;
    const newFetch = createFetch({ requestReducers: [reducer] });
    await newFetch();
    expect(global.fetch).toHaveBeenCalledWith(reducerResult.url, reducerResult);
  });

  describe('with multiple request reducers', () => {
    it('passes the result of the first reducer to the second reducer', async () => {
      const firstInterceptorResult = { foo: 'bar' };
      const firstInterceptor = jest.fn(() => firstInterceptorResult);
      const secondInterceptor = jest.fn(() => ({}));
      const newFetch = createFetch({
        requestReducers: [firstInterceptor, secondInterceptor],
      });
      await newFetch('someUrl');
      expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
    });
  });

  describe('with multiple asynchronous request reducers', () => {
    it('passes the result of the first reducer to the second reducer', async () => {
      const firstInterceptorResult = { foo: 'bar' };
      const firstInterceptor = jest.fn(() => Promise.resolve(firstInterceptorResult));
      const secondInterceptor = jest.fn(() => Promise.resolve({}));
      const newFetch = createFetch({
        requestReducers: [firstInterceptor, secondInterceptor],
      });
      await newFetch('someUrl');
      expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
    });
  });

  describe('when a request reducer throws an error', () => {
    it('is immediately raised', async () => {
      const reducerError = new Error();
      const reducer = () => {
        throw reducerError;
      };
      const newFetch = createFetch({ requestReducers: [reducer] });
      await expect(newFetch()).rejects.toBe(reducerError);
    });
  });

  describe('when the fetch() resolves', () => {
    it('invokes the response reducers with the Response', async () => {
      const mockResponse = { foo: 'bar' };
      global.fetch = jest.fn(() => Promise.resolve(mockResponse));

      const reducer = jest.fn(() => ({}));
      const newFetch = createFetch({ responseReducers: [reducer] });

      await newFetch();
      expect(reducer).toHaveBeenCalledWith(mockResponse);
    });

    it('returns a Promise that resolves with the return value of the reducer', async () => {
      const mockResult = { foo: 'bar' };
      const reducer = jest.fn(() => mockResult);
      const newFetch = createFetch({ responseReducers: [reducer] });

      const result = await newFetch();
      expect(result).toBe(mockResult);
    });

    it('waits for an asynchronous response reducer', async () => {
      const mockResult = { foo: 'bar' };
      const reducer = jest.fn(() => Promise.resolve(mockResult));

      const newFetch = createFetch({ responseReducers: [reducer] });

      const result = await newFetch();
      expect(result).toBe(mockResult);
    });

    describe('and there are multiple response reducers', () => {
      it('invokes the second response reducer with the result of the first', async () => {
        const firstInterceptorResult = { foo: 'bar' };
        const firstInterceptor = jest.fn(() => firstInterceptorResult);
        const secondInterceptor = jest.fn(() => ({}));

        const newFetch = createFetch({
          responseReducers: [firstInterceptor, secondInterceptor],
        });

        await newFetch();
        expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
      });
    });

    describe('and there are multiple asynchronous response reducers', () => {
      it('invokes the second response reducer with the result of the first', async () => {
        const firstInterceptorResult = { foo: 'bar' };
        const firstInterceptor = jest.fn(() => Promise.resolve(firstInterceptorResult));
        const secondInterceptor = jest.fn(() => {});

        const newFetch = createFetch({
          responseReducers: [firstInterceptor, secondInterceptor],
        });

        await newFetch();
        expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
      });
    });
  });

  describe('when a response reducer throws an error', () => {
    it('is immediately raised', async () => {
      const reducerError = new Error();
      const reducer = () => {
        throw reducerError;
      };
      const newFetch = createFetch({ responseReducers: [reducer] });
      await expect(newFetch()).rejects.toBe(reducerError);
    });
  });
});
