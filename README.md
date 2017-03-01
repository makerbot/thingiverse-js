[![npm version](https://badge.fury.io/js/thingiverse-js.svg)](https://badge.fury.io/js/thingiverse-js)
[![Build status](https://travis-ci.org/makerbot/thingiverse-js.svg?branch=master)](https://travis-ci.org/makerbot/thingiverse-js)
[![Dependencies](https://david-dm.org/makerbot/thingiverse-js.svg)](https://david-dm.org/makerbot/thingiverse-js)

## Use

This library is a wrapper over the excellent [got](https://github.com/sindresorhus/got) HTTP request library.
We've added some Thingiverse-specific conveniences, but all features of _got_ will work here. Please review their
[documentation](https://github.com/sindresorhus/got#readme).

```sh
npm install thingiverse-js
```
```js
const thingiverse = require('thingiverse-js');
```

### API

In addition to the standard [got](https://github.com/sindresorhus/got) methods, we've added
some conveniences.

#### thingiverse(path, opts)

Returns a Promise for the API request. This Promise is the return value from a _got_ request.

##### path

Should be a string containing the endpoint you're calling (`/users/me` for example). The leading slash is optional.

##### opts

Should be an object containing, at least, the OAuth access token set to the property `token`. Other _got_ options may be added.

#### thingiverse.getAuthorizeUrl(opts)

Returns a string containing the URL that will allow your users to authorize your application.

##### opts

Type: `object`, `string`

As an object, this parameter must contain your `client_id` in the form `{ query: { client_id: 'abcdef123' } }`. Other _got_ options may be added.
As a string, simply pass your `client_id`.

#### thingiverse.getError(response)

Returns a string containing the error that occured in your API request.

##### response

Type: `object`

Should be the response object returned from an API request (usually, `err.response).

#### thingiverse.getAccessToken(opts)

Builds a request for exchanging an OAuth authorization code for an access token. Returns a Promise.

##### opts

Type: `object`

At a minimum, this object must contain your `client_id`, `client_secret`, and the `code`
returned after a user authorizes your application. Use the form:
```js
{
  body: {
    client_id: 'abcdef123',
    client_secret: 'tuvwxzy789',
    code: 'mnopqrs456'
  }
}
```
