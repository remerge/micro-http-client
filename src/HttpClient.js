export default function HttpClient(options = {}) {
  const {requestInterceptors = [], responseInterceptors = []} = options;
  const client = {
    fetch(url, requestObject) {
      let newRequestObject = Object.assign({}, {url}, requestObject);
      newRequestObject = requestInterceptors.reduce((prevInterceptorResult, interceptor) => {
        return interceptor(prevInterceptorResult);
      }, newRequestObject);

      const responsePromise = fetch(newRequestObject.url, newRequestObject);
      return responsePromise.then((response) => {
        return responseInterceptors.reduce((prevInterceptorResult, interceptor) => {
          return interceptor(prevInterceptorResult);
        }, response);
      });
    },
  };
  return client;
}
