async function processInterceptor(memo, interceptor) {
  return interceptor(await memo);
}

async function fetch(requestReducers, responseReducers, url, options) {
  const requestObject = await requestReducers.reduce(processInterceptor, Object.assign({}, { url }, options));
  const response = await fetch(requestObject.url, requestObject);
  return responseReducers.reduce(processInterceptor, response);
}

export default function createFetch({ requestReducers = [], responseReducers = [] }) {
  return fetch.bind(requestReducers, responseReducers);
}
