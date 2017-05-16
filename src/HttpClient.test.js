import HttpClient from './HttpClient';

(function mockGlobalFetch() {
  const originalFetch = window.fetch;

  beforeEach(() => {
    window.fetch = jest.fn(() => Promise.resolve());
  });

  afterAll(() => {
    window.fetch = originalFetch;
  });
})();

describe('HttpClient', () => {
  let httpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
  });

  it('calls `fetch`', async () => {
    const url = 'some/url';
    const requestObject = {foo: 'bar'};
    await httpClient.fetch(url, requestObject);
    expect(window.fetch).toHaveBeenCalledWith(url, {url, foo: 'bar'});
  });

  it('invokes request interceptors with the request object', async () => {
    const interceptor = jest.fn(() => {
      return {};
    });
    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    const url = 'some/url';
    await httpClient.fetch(url, {body: 'some body'});
    expect(interceptor).toHaveBeenCalledWith({url, body: 'some body'});
  });

  it('waits for an asynchronous request interceptor', async () => {
    const mockRequest = {url: 'mockUrl', foo: 'bar'};
    const interceptor = jest.fn(() => {
      return Promise.resolve(mockRequest);
    });

    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    await httpClient.fetch();
    expect(window.fetch).toHaveBeenCalledWith(mockRequest.url, mockRequest);
  });

  it('calls `fetch` with the output of the interceptors', async () => {
    const interceptorResult = {method: 'POST', url: 'somewhere.com'};
    const interceptor = () => {
      return interceptorResult;
    };
    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    await httpClient.fetch();
    expect(window.fetch).toHaveBeenCalledWith(interceptorResult.url, interceptorResult);
  });

  describe('with multiple request interceptors', () => {
    it('passes the result of the first interceptor to the second interceptor', async () => {
      const firstInterceptorResult = {foo: 'bar'};
      const firstInterceptor = jest.fn(() => firstInterceptorResult);
      const secondInterceptor = jest.fn(() => {
        return {};
      });
      httpClient = new HttpClient({
        requestInterceptors: [firstInterceptor, secondInterceptor],
      });
      await httpClient.fetch('someUrl');
      expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
    });

    describe('which are asynchronous', () => {
      it('passes the result of the first interceptor to the second interceptor', async () => {
        const firstInterceptorResult = {foo: 'bar'};
        const firstInterceptor = jest.fn(() => Promise.resolve(firstInterceptorResult));
        const secondInterceptor = jest.fn(() => Promise.resolve({}));
        httpClient = new HttpClient({
          requestInterceptors: [firstInterceptor, secondInterceptor],
        });
        await httpClient.fetch('someUrl');
        expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
      });
    });
  });

  describe('when a request interceptor throws an error', () => {
    it('is immediately raised', async () => {
      const interceptorError = new Error();
      const interceptor = () => {
        throw interceptorError;
      };
      httpClient = new HttpClient({requestInterceptors: [interceptor]});
      await expect(httpClient.fetch()).rejects.toBe(interceptorError);
    });
  });

  describe('when the fetch() resolves', () => {
    it('invokes the response interceptors with the Response', async () => {
      const mockResponse = {foo: 'bar'};
      window.fetch = jest.fn(() => Promise.resolve(mockResponse));

      const interceptor = jest.fn(() => {
        return {};
      });
      httpClient = new HttpClient({responseInterceptors: [interceptor]});

      await httpClient.fetch();
      expect(interceptor).toHaveBeenCalledWith(mockResponse);
    });

    it('returns a Promise that resolves with the return value of the interceptor', async () => {
      const mockResult = {foo: 'bar'};
      const interceptor = jest.fn(() => {
        return mockResult;
      });
      httpClient = new HttpClient({responseInterceptors: [interceptor]});

      const result = await httpClient.fetch();
      expect(result).toBe(mockResult);
    });

    it('waits for an asynchronous response interceptor', async () => {
      const mockResult = {foo: 'bar'};
      const interceptor = jest.fn(() => Promise.resolve(mockResult));

      httpClient = new HttpClient({responseInterceptors: [interceptor]});

      const result = await httpClient.fetch();
      expect(result).toBe(mockResult);
    });

    describe('and there are multiple response interceptors', () => {
      it('invokes the second response interceptor with the result of the first', async () => {
        const firstInterceptorResult = {foo: 'bar'};
        const firstInterceptor = jest.fn(() => firstInterceptorResult);
        const secondInterceptor = jest.fn(() => {
          return {};
        });

        httpClient = new HttpClient({
          responseInterceptors: [firstInterceptor, secondInterceptor],
        });

        await httpClient.fetch();
        expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
      });

      describe('which are asynchronous', () => {
        it('invokes the second response interceptor with the result of the first', async () => {
          const firstInterceptorResult = {foo: 'bar'};
          const firstInterceptor = jest.fn(() => Promise.resolve(firstInterceptorResult));
          const secondInterceptor = jest.fn(() => {});

          httpClient = new HttpClient({
            responseInterceptors: [firstInterceptor, secondInterceptor],
          });

          await httpClient.fetch();
          expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
        });
      });
    });
  });

  describe('when a response interceptor throws an error', () => {
    it('is immediately raised', async () => {
      const interceptorError = new Error();
      const interceptor = () => {
        throw interceptorError;
      };
      httpClient = new HttpClient({responseInterceptors: [interceptor]});
      await expect(httpClient.fetch()).rejects.toBe(interceptorError);
    });
  });
});
