const hasOwnProperty = (object, property) => Object.hasOwnProperty.call(object, property);

class InterceptorError extends Error {
  constructor(message, additional = {}) {
    super(message);
    this.message = message;
    Object.assign(additional);
  }
}

function stripTrailingSlash(string) {
  if (string[string.length - 1] !== '/') return string;
  return string.slice(0, -1);
}

export function prependHost(host) {
  const sanitizedHost = stripTrailingSlash(host);
  return (request) => {
    const { url: absolutePath } = request;
    if (absolutePath[0] !== '/') {
      throw new InterceptorError('prependHost() requires an absolute path', { request });
    }
    return Object.assign({}, request, { url: `${sanitizedHost}${absolutePath}` });
  };
}

export function addHeaders(headers) {
  return async (request) => {
    if (typeof headers === 'function') {
      const newHeaders = Object.assign({}, await headers(), request.headers);
      return Object.assign({}, request, { headers: newHeaders });
    }

    const newHeaders = Object.assign({}, headers, request.headers);
    return Object.assign({}, request, { headers: newHeaders });
  };
}

export function processBody(processorFunction) {
  return async (request) => {
    if (!hasOwnProperty(request, 'body')) return request;
    return Object.assign({}, request, { body: await processorFunction(request.body) });
  };
}
