async function processInterceptor(memo, interceptor) {
  return interceptor(await memo);
}

function HttpClient({ requestInterceptors = [], responseInterceptors = [] } = {}) {
  const client = Object.create(HttpClient.prototype);

  Object.assign(client, {
    async fetch(url, options) {
      const requestObject = await requestInterceptors.reduce(processInterceptor, Object.assign({}, { url }, options));
      const response = await fetch(requestObject.url, requestObject);
      return responseInterceptors.reduce(processInterceptor, response);
    },
  });

  return client;
}

export default HttpClient;
