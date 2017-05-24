# micro-http-client

A thin wrapper over [fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API), used to specify common request and response processing in a single location.

Special thanks to [Remerge](https://www.remerge.io/) for open sourcing this library.

## Motivation

The Fetch API covers about 90% of the use cases that most existing HTTP client libraries exist to address. However, in practice you often want to handle all of an application's requests the same way, coupled to application state (like authentication credentials). This library exists to solve that problem.

Many of the existing implementations also offer extensive APIs for common scenarios, with fluent interfaces and lots of methods. This library aims to do the opposite, offering the minimum surface area capable of addressing all typical application scenarios.

In particular this library aims to offer an API whose usage can be verified through static analysis, so the utility functions offered here are all named exports, they never mutate their inputs, and they're stateless. In other words, aim to be unbreakable.

## Usage

```js
import { createFetch, prependHost, addHeaders, processBody, rejectIfUnsuccessful } from '@remerge/http-client';
import store from 'my-application-state';

const fetch = createFetch({
  requestReducers: [
    prependHost(process.env.API_HOST),
    addHeaders({
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/json',
    }),
    addHeaders(() => store.getAuthorizationHeaders()),
    processBody(JSON.stringify),
  ],
  responseReducers: [
    rejectIfUnsuccessful,
    response => response.json(),
  ],
});

fetch('/profile');
```

This defines a client which will prepend the `process.env.API_HOST` host to incoming request URLs, add default content type headers and authorization headers from the application store and send the request body as a JSON string.

Responses with a non-successful status code will cause the Promise chain to reject, and will otherwise be unwrapped, returning only the parsed JSON body of the Response.

## Installation

Available as an NPM exporting a UMD module.

```sh
# npm install micro-http-client
yarn add micro-http-client
```

## Reducers

A reducer is a function which takes a request or response object and returns a new object. Each will be called in turn to set up the request before it's passed to `global.fetch()`, and process the response once it's received.

Reducers may return a Promise.

### Request Reducer

```js
function requestReducer(request: Object) => Promise<Object> | Object;
```

A request reducer is any function that takes a request object and returns a new request object. A simple example of a request reducer might be one that adds headers to the request before it's sent.

#### `request`

The `request` parameter is always an object matching the second parameter of the [Request constructor](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request), with an additional `url` property assigned the value passed as the first argument to the `fetch()` method.

It is a plain JavaScript object rather than a `Request` instance because `Request` instances are very difficult to reduce over: you can only mutate the `Headers` object in-place, and the `body` of the `Request` is only accessible as a stream, which is single-use and difficult to clone.

Plain JavaScript objects, on the other hand, are easy to work with, well-understood and many tools exist that can process them.

### Response Reducer

```js
function responseReducer(response: any) => any;
```

Response reducers may take and receive anything, the only restriction is that the first response reducer will receive the result of the `fetch()` call directly, so it is guaranteed to be a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance.

Like `Request`s, `Response` instances are very difficult to reduce over, but there are many situations where the stream properties of the `Response` might be useful, so this library does not modify the original `Response` object at all.

For the common case where only the body of the `Response` is desired, it can be trivially converted with a one-line function. Subsequent reducers can then process the result as a plain JavaScript object.

```js
const fetch = createFetch({
  responseReducers: [
    response => response.json(),
  ],
});
```

## API

### `createFetch({ requestReducers: [], responseReducers: [] })`

Takes as input two arrays, one of request reducers and one of response reducers.

Returns a function identical to the global [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) method in its two-parameter form.

```js
function fetch(url: String, options: Object) => Promise
```

Note that it does not accept a `Request` object (as in the one-parameter form of `fetch()`) because these are problematic to reduce over.

When called, it will:

1. Construct a copy of the `options` object with an additional `url` property assigned the value of the `url` parameter
2. Iterate over the `requestReducers` array, invoking the first function with the object from `#1`, and each subsequent reducer function with the return value of the last
3. Call the global `fetch()` method with the result
4. Iterate over the `responseReducers` array, invoking the first function with the `Response` from `fetch()`, and each subsequent reducer function with the return value of the last
5. Return a Promise that resolves with the result

## Standard Reducers

Included is a collection of basic reducers to facilitate common application scenarios. Don't like them? Don't use them, they're very small and easy to replace with your own functions.

### `prependHost(string)`

Prepends the given host to all requests. Requests are expected to contain a URL which is an absolute path fragment.

Note that any URL which isn't an absolute path will cause an error, since "prepend host" doesn't make sense if a host is already present. We could replace the host, but that's not necessarily predictable behavior.

Worse, by using this reducer the consumer is indicating that they expect all processed requests to be delivered to the same host and it's likely they'll be adding authentication information etc. If we transparently deliver the request to a different host we might accidentally expose that.

Moreover, it's more likely to be an error than not if the consumer has given us a URL with a fully-specified host.

#### Examples

```js
const fetch = createFetch({ requestReducers: [
  prependHost('https://api.remerge.io/'),
]});
fetch('/campaigns'); // -> GET "https://api.remerge.io/campaigns"
fetch('https://www.google.com') // throws ReducerError
```

### `addHeaders(object|function)`

Includes the given headers in every request. Useful for MIME type and authentication headers.

Parameter may be an object or a function returning an object or a Promise resolving to an object.

Any headers specified on the request will override those set using `addHeaders()`.

#### Examples

```js
const fetch = createFetch({ requestReducers: [
  addHeaders({ Accept: 'application/json' }),
  addHeaders(() => this.getAuthenticationHeaders()),
]});
fetch('/campaigns'); // -> { Accept: 'application/json', auth headers... }
fetch('/campaigns', { headers: { Accept: 'text/csv' } }); // -> { Accept: 'text/csv' }
```

### `processBody(function)`

Applies the given function to the request or response body, replacing the original. The function may return a promise.

The function will not be invoked unless the body property is present.

Note that a GET or HEAD request cannot have a body, and no special handling is included for converting the body to URL parameters, although this would be a good candidate for a future reducer.

#### Examples

```js
const fetch = createFetch({
  requestReducers: [ processBody(JSON.stringify) ],
  responseReducers: [ (response) => response.json(), processBody(JSON.parse) ],
});
```

### `rejectIfUnsuccessful`

Throws an error on any non-success HTTP status code.

#### Examples

```js
const fetch = createFetch({
  responseReducers: [ rejectIfUnsuccessful ],
});
fetch('/my/profile', { method: 'PUT' })
  .catch((error) => {
    if (error.response.status === 422) {
      // Handle validation failure
    }
  })
```
