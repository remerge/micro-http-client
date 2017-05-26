const global = (function getGlobalObject() {
  /* eslint-disable no-eval */
  return this || (1, eval)('this');
}());

async function processInterceptor(memo, interceptor) {
  return interceptor(await memo);
}

async function localFetch(globalFetch, requestReducers, responseReducers, url, options) {
  const requestObject = await requestReducers.reduce(processInterceptor, Object.assign({}, { url }, options));
  const response = await globalFetch(requestObject.url, requestObject);
  return responseReducers.reduce(processInterceptor, response);
}

export default function createFetch({ requestReducers = [], responseReducers = [] }) {
  return localFetch.bind(null, global.fetch, requestReducers, responseReducers);
}
