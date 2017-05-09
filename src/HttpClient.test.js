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

  it('makes a request', () => {
    const requestObject = {foo: 'bar'};
    httpClient.fetch(requestObject);
    expect(window.fetch).toHaveBeenCalledWith(requestObject);
  });
});
