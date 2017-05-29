async function processInterceptor(memo, interceptor) {
  return interceptor(await memo);
}

async function localFetch(globalFetch, requestReducers, responseReducers, url, options) {
  const requestObject = await requestReducers.reduce(processInterceptor, Object.assign({}, { url }, options));
  const response = await globalFetch(requestObject.url, requestObject);
  return responseReducers.reduce(processInterceptor, response);
}

export default function createFetch({ requestReducers = [], responseReducers = [] }) {
  return localFetch.bind(null, fetch, requestReducers, responseReducers);
}
