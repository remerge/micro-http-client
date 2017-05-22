# HttpClient

Defines a thin client around the [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API).

A client is defined as a set of "interceptors", used to process requests and responses in a consistent, centralized manner for an application. Useful for decoupling application state (like authentication credentials) from persistence infrastructure.

## Interceptors

Interceptors are plain JavaScript functions which take a request or response object and return a modified object (i.e. request/repsonse reducers).

## API

### `HttpClient({ requestInterceptors: <array>, responseInterceptors: <array> })`

### `HttpClient::fetch(url, options)`

The client exposes a single method, identical to the browser Fetch method in its two-parameter form. Note that it does not accept a `Request` object, as these are problematic to reduce over.

### Return value

Returns a Promise that resolves with the result of calling the global `fetch()` with the processed request object, then applying each of the response interceptors to the result.

Note that the global `fetch()` resolves with a [`Response` object](https://developer.mozilla.org/en-US/docs/Web/API/Response), whose behavior can be somewhat unexpected - e.g. the `headers` property is a [`Headers` object](https://developer.mozilla.org/en-US/docs/Web/API/Headers) rather than a POJO, and the body is a single-use stream.

## Standard Interceptors

Included is a collection of basic interceptors to facilitate the following common application scenarios:

- adding MIME type headers (e.g. `'application/json'`)
- adding authentication headers
- processing the request body as a JSON string
- converting the response body to JSON
- rejecting HTTP error codes
- processing the response stream e.g. to render a large image as it downloads

### `prependHost(string)`

Prepends the given host to all requests. Requests are expected to contain a URL which is an absolute path fragment.

Note that any URL which isn't an absolute path will cause an error, since "prepend host" doesn't make sense if a host is already present. We could replace the host, but that's not necessarily predictable behavior.

Worse, by using this interceptor the consumer is indicating that they expect all processed requests to be delivered to the same host and it's likely they'll be adding authentication information etc. If we transparently deliver the request to a different host we might accidentally expose that.

Moreover, it's more likely to be an error than not if the consumer has given us a URL with a fully-specified host.

#### Examples

```js
const client = new HttpClient({ requestInterceptors: [
  prependHost('https://api.remerge.io/'),
]});
client.fetch('/campaigns'); // -> GET "https://api.remerge.io/campaigns"
client.fetch('https://www.google.com') // throws InterceptorError
```

### `addHeaders(object|function)`

Includes the given headers in every request. Useful for MIME type and authentication headers.

Parameter may be an object or a function returning an object or a Promise resolving to an object.

Any headers specified on the request will override those set using `addHeaders()`.

#### Examples

```js
const client = new HttpClient({ requestInterceptors: [
  addHeaders({ Accept: 'application/json' }),
  addHeaders(() => this.getAuthenticationHeaders()),
]});
client.fetch('/campaigns'); // -> { Accept: 'application/json', auth headers... }
client.fetch('/campaigns', { headers: { Accept: 'text/csv' } }); // -> { Accept: 'text/csv' }
```

### `processBody(function)`

Applies the given function to the request or response body, replacing the original. The function may return a promise.

The function will not be invoked unless the body property is present.

Note that a GET or HEAD request cannot have a body, and no special handling is included for converting the body to URL parameters, although this would be a good candidate for a future interceptor.

#### Examples

```js
const client = new HttpClient({
  requestInterceptors: [ processBody(JSON.stringify) ],
  responseInterceptors: [ (response) => response.json(), processBody(JSON.parse) ],
});
```
