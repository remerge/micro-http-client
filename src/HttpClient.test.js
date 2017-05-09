import HttpClient from './HttpClient';

(function mockGlobalFetch() {
  const originalFetch = window.fetch;

  beforeEach(() => {
    window.fetch = jest.fn();
  });

  afterAll(() => {
    window.fetch = originalFetch;
  });
})();

/*

Examples:

  function snakeToCamelCase(response) {
    ...
  }

  const httpClient = new HttpClient({
    requestInterceptors: [
      addBaseUrl('https://api.remerge.io'),
      addDefaultHeaders({ Accept: 'application/json' }),
      (request) => Object.assign({}, request, { body: camelToSnakeCase(request.body) }),
    ],

    responseInterceptors: [
      logOutIfCredentialsInvalid,
      rejectHttpFailures,
      parseResponseBodyAsJSON,
      snakeToCamelCase,
    ],
  });

  httpClient.fetch('/some/url', { method: 'POST', body: {} });
*/
describe('HttpClient', () => {
  let httpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
  });

  it('calls `fetch`', () => {
    const url = 'some/url';
    const requestObject = {foo: 'bar'};
    httpClient.fetch(url, requestObject);
    expect(window.fetch).toHaveBeenCalledWith(url, {url, foo: 'bar'});
  });

  it('invokes request interceptors with the request object', () => {
    const interceptor = jest.fn(() => {
      return {};
    });
    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    const url = 'some/url';
    httpClient.fetch(url, {body: 'some body'});
    expect(interceptor).toHaveBeenCalledWith({url, body: 'some body'});
  });

  it('calls `fetch` with the output of the interceptors', () => {
    const interceptorResult = {method: 'POST', url: 'somewhere.com'};
    const interceptor = () => {
      return interceptorResult;
    };
    httpClient = new HttpClient({requestInterceptors: [interceptor]});
    httpClient.fetch();
    expect(window.fetch).toHaveBeenCalledWith(
      interceptorResult.url,
      interceptorResult
    );
  });

  describe('with multiple request interceptors', () => {
    beforeEach(() => {
      // function addBaseUrl(request) {
      //   const url = request.url;
      //   return newRequest;
      // }
    });

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
});
