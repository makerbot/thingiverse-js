'use strict';

const chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , FormData = require('form-data')
  , thingiverse = require('../lib')
  , _ = require('lodash')
  ;

describe('thingiverse object tests', () => {
  it('has all methods', () => {
    thingiverse.should.contain.all.keys([
      'get',
      'post',
      'put',
      'patch',
      'head',
      'delete'
    ]);
  })

  it('has stream', () => {
    expect(thingiverse.stream).to.exist;
  })

  it('has utility methods', () => {
    thingiverse.should.contain.all.keys([
      'getError',
      'getAuthorizeUrl',
      'getAccessToken',
    ]);
  })
})

describe('getError tests', () => {
  const res = {
    headers: { 'x-error': 'Beefy-armed error message' },
    body: { error: 'An error with barbie legs' }
  };

  it('checks the x-error header', () => {
    thingiverse.getError(res).should.eq(res.headers['x-error']);
  })

  it('returns the body if x-error header empty', () => {
    thingiverse.getError(
      _.assign({}, res, { headers: { 'x-error': null } })
    ).should.eq(res.body.error);
  })

  it('returns null if the body and x-error header are empty', () => {
    expect(thingiverse.getError()).to.be.null;
  })
});

describe('getFinalizeUrl tests', () => {
  const res = {
    headers: { location: 'http://www.thingiverse.com' }
  };

  it('checks the x-error header', () => {
    thingiverse.getFinalizeUrl(res).should.eq(res.headers.location);
  })

  it('returns null if location header is empty', () => {
    expect(thingiverse.getFinalizeUrl({})).to.be.null;
  })
});

describe('getAuthorizeUrl tests', () => {
  it('returns expected URL (object param)', () => {
    thingiverse.getAuthorizeUrl({ query: { client_id: 'abcdef123' } }).should.eq(
      'https://www.thingiverse.com/login/oauth/authorize?client_id=abcdef123'
    );
  })

  it('returns expected URL (string param)', () => {
    thingiverse.getAuthorizeUrl('abcdef123').should.eq(
      'https://www.thingiverse.com/login/oauth/authorize?client_id=abcdef123'
    );
  })

  it('throws if missing client_id (object param)', () => {
    const fn = _.partial(thingiverse.getAuthorizeUrl, {});
    expect(fn).to.throw;
  })

  it('throws if missing client_id (string param)', () => {
    const fn = _.partial(thingiverse.getAuthorizeUrl, '');
    expect(fn).to.throw;
  })

  it('can override URL elements', () => {
    thingiverse.getAuthorizeUrl({
      protocol: 'http:',
      hostname: 'www.thingiverse.dev',
      port: 8888,
      query: { client_id: 'abcdef123' }
    }).should.eq(
      'http://www.thingiverse.dev:8888/login/oauth/authorize?client_id=abcdef123'
    );
  })
});

describe('getForm tests', () => {
  const data = {
    human: 'good',
    cylon: 'bad'
  };

  it('returns a FormData instance', () => {
    thingiverse.getForm().should.be.an.instanceof(FormData)
      .and.have.property('_valueLength', 0);
  });

  it('adds given fields', () => {
    thingiverse.getForm(data).getLengthSync().should.be.gt(0);
  });
});
