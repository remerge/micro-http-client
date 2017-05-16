async function processInterceptor(memo, interceptor) {
  return interceptor(await memo);
}

export default function HttpClient(options = {}) {
  const {requestInterceptors = [], responseInterceptors = []} = options;
  const client = {
    async fetch(url, options) {
      let requestObject = await requestInterceptors.reduce(processInterceptor, Object.assign({}, {url}, options));
      let response = await fetch(requestObject.url, requestObject);
      return responseInterceptors.reduce(processInterceptor, response);
    },
  };
  return client;
}
