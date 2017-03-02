'use strict';

const got = require('got');
const url = require('url');
const _ = require('lodash');
const assert = require('assert');
const pkg = require('../package');
const FormData = require('form-data');

// promisify FormData.getLength method
FormData.prototype.getLengthAsync = function() {
  return new Promise((resolve, reject) => {
    this.getLength((err, length) => {
      if (err) return reject(err);
      resolve(length);
    });
  });
};

const defaultHost = {
  protocol: 'https:',
  slashes: true,
  hostname: 'api.thingiverse.com',
  pathname: '/'
};

function thingiverse(path, opts) {
  assert(_.isString(path), `Expected 'path' to be a string, got ${typeof path}`);
  path = _.trimEnd(path, '/');
  assert(path, `Value of 'path' must not be "/" or empty`);

	const env = process.env;
	opts = _.assign({
		json: true,
		token: env.THINGIVERSE_TOKEN,
		domain: env.THINGIVERSE_API_DOMAIN || url.format(defaultHost)
	}, opts);

  assert(_.isString(opts.token), 'OAuth token not set');

	opts.headers = _.assign({
    accept: 'application/json',
    authorization: `Bearer ${opts.token}`,
    'user-agent': `${pkg.name}/${pkg.version} (https://github.com/makerbot/thingiverse-js)`
	}, opts.headers);

	if (_.isPlainObject(opts.body)) {
		opts.headers['content-type'] = 'application/json';
		opts.body = JSON.stringify(opts.body);
	}

	const endpoint = path.startsWith('http') ? path : url.resolve(opts.domain, path);
	if (opts.stream) {
		return got.stream(endpoint, opts);
	}
	return got(endpoint, opts);
}

thingiverse.stream = (url, opts) => thingiverse(url, _.assign({}, opts, {
	json: false,
	stream: true
}));

thingiverse.getError = res => {
  return _.get(res, ['headers', 'x-error'])
    || _.get(res, ['body', 'error'])
    || null;
};

function assertParams(params, fields) {
  params = _.isString(params) ? JSON.parse(params) : params;
  _.each(fields,
    field => assert(_.isString(params[field]), `Missing "${field}" field`)
  );
}

thingiverse.getAuthorizeUrl = opts => {
  if (_.isString(opts)) {
    opts = { query: { client_id: opts } };
  }
  assertParams(opts.query, ['client_id']);
  return url.format(_.assign({}, defaultHost, {
    hostname: 'www.thingiverse.com',
    pathname: '/login/oauth/authorize'
  }, opts));
};

thingiverse.getAccessToken = opts => {
  opts = _.assign({
    domain: 'www.thingiverse.com'
  }, opts);
  assertParams(opts.body, ['code', 'client_id', 'client_secret']);
  return thingiverse.post('/login/oauth/access_token', opts);
};

thingiverse.getForm = data => {
  return _.transform(data, (form, value, field) => {
    form.append(field, value);
  }, new FormData());
};

thingiverse.getFinalizeUrl = res => {
  return _.get(res, 'headers.location', null);
};

thingiverse.fileUpload = (storageUrl, form, opts) => {
  form = form instanceof FormData ? form : thingiverse.getForm(form);
  return form.getLengthAsync().then(length => {
    return got.post(storageUrl, {
      body: form,
      headers: { 'content-length': length },
      followRedirect: false // S3 returns a 303 but we don't want to follow
    });
  }).then(res => {
    return thingiverse.post(thingiverse.getFinalizeUrl(res), _.assign({
      query: {}
    }, opts));
  });
};

const helpers = [
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
];
for (const x of helpers) {
	const method = x.toUpperCase();
	thingiverse[x] = (url, opts) => thingiverse(url, _.assign({}, opts, {method}));
	thingiverse.stream[x] = (url, opts) => thingiverse.stream(url, _.assign({}, opts, {method}));
}

module.exports = thingiverse;
