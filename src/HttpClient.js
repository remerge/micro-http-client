export default function HttpClient(options = {}) {
  const {requestInterceptors = [], responseInterceptors = []} = options;
  const client = {
    fetch(url, requestObject) {
      let newRequestObject = Object.assign({}, {url}, requestObject);
      return Promise.resolve(
        requestInterceptors.reduce((memo, interceptor) => {
          return Promise.resolve(memo).then((prevInterceptorResult) => {
            return interceptor(prevInterceptorResult);
          });
        }, newRequestObject)
      ).then((newRequestObject) => {
        return fetch(newRequestObject.url, newRequestObject).then((response) => {
          return responseInterceptors.reduce((memo, interceptor) => {
            return Promise.resolve(memo).then((prevInterceptorResult) => {
              return interceptor(prevInterceptorResult);
            });
          }, response);
        });
      });
    },
  };
  return client;
}
