# HttpClient

## Standard Interceptors

### `prependHost(host)`

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
