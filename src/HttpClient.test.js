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

  it('calls `fetch`', () => {
    const url = 'some/url';
    const requestObject = {foo: 'bar'};
    return httpClient.fetch(url, requestObject).then(() => {
      expect(window.fetch).toHaveBeenCalledWith(url, {url, foo: 'bar'});
    });
  });

  it('invokes request interceptors with the request object', () => {
    const interceptor = jest.fn(() => {
      return {};
    });
    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    const url = 'some/url';
    return httpClient.fetch(url, {body: 'some body'}).then(() => {
      expect(interceptor).toHaveBeenCalledWith({url, body: 'some body'});
    });
  });

  it('waits for an asynchronous request interceptor', () => {
    const mockRequest = {url: 'mockUrl', foo: 'bar'};
    const interceptor = jest.fn(() => {
      return Promise.resolve(mockRequest);
    });

    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    return httpClient.fetch().then(() => {
      expect(window.fetch).toHaveBeenCalledWith(mockRequest.url, mockRequest);
    });
  });

  it('calls `fetch` with the output of the interceptors', () => {
    const interceptorResult = {method: 'POST', url: 'somewhere.com'};
    const interceptor = () => {
      return interceptorResult;
    };
    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    return httpClient.fetch().then(() => {
      expect(window.fetch).toHaveBeenCalledWith(interceptorResult.url, interceptorResult);
    });
  });

  describe('with multiple request interceptors', () => {
    it('passes the result of the first interceptor to the second interceptor', () => {
      const firstInterceptorResult = {foo: 'bar'};
      const firstInterceptor = jest.fn(() => firstInterceptorResult);
      const secondInterceptor = jest.fn(() => {
        return {};
      });
      httpClient = new HttpClient({
        requestInterceptors: [firstInterceptor, secondInterceptor],
      });
      httpClient.fetch('someUrl');
      expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
    });
  });

  describe('when the fetch() resolves', () => {
    it('invokes the response interceptors with the Response', () => {
      const mockResponse = {foo: 'bar'};
      window.fetch = jest.fn(() => Promise.resolve(mockResponse));

      const interceptor = jest.fn(() => {
        return {};
      });
      httpClient = new HttpClient({responseInterceptors: [interceptor]});

      return httpClient.fetch().then(() => {
        expect(interceptor).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('returns a Promise that resolves with the return value of the interceptor', () => {
      window.fetch = jest.fn(() => Promise.resolve());

      const mockResult = {foo: 'bar'};
      const interceptor = jest.fn(() => {
        return mockResult;
      });
      httpClient = new HttpClient({responseInterceptors: [interceptor]});

      return httpClient.fetch().then((result) => {
        expect(result).toBe(mockResult);
      });
    });

    describe('and there are multiple response interceptors', () => {
      it('invokes the second response interceptor with the result of the first', () => {
        window.fetch = jest.fn(() => Promise.resolve());

        const firstInterceptorResult = {foo: 'bar'};
        const firstInterceptor = jest.fn(() => firstInterceptorResult);
        const secondInterceptor = jest.fn(() => {
          return {};
        });

        httpClient = new HttpClient({
          responseInterceptors: [firstInterceptor, secondInterceptor],
        });

        return httpClient.fetch().then(() => {
          expect(secondInterceptor).toHaveBeenCalledWith(firstInterceptorResult);
        });
      });
    });
  });
});
