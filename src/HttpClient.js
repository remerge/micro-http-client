export default function HttpClient(options = {}) {
  const {requestInterceptors = [], responseInterceptors = []} = options;
  const client = {
    fetch(url, requestObject) {
      let newRequestObject = Object.assign({}, {url}, requestObject);
      newRequestObject = requestInterceptors.reduce((prevInterceptorResult, interceptor) => {
        return interceptor(prevInterceptorResult);
      }, newRequestObject);

      return fetch(newRequestObject.url, newRequestObject).then((response) => {
        return responseInterceptors.reduce((prevInterceptorResult, interceptor) => {
          return interceptor(prevInterceptorResult);
        }, response);
      });
    },
  };
  return client;
}
