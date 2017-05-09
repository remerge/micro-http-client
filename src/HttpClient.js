export default function HttpClient(options = {}) {
  const {requestInterceptors = []} = options;
  const client = {
    fetch(url, requestObject) {
      let newRequestObject = Object.assign({}, {url}, requestObject);
      newRequestObject = requestInterceptors.reduce(
        (prevInterceptorResult, interceptor) => {
          return interceptor(prevInterceptorResult);
        },
        newRequestObject
      );

      fetch(newRequestObject.url, newRequestObject);
    },
  };
  return client;
}
