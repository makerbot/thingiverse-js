'use strict';

const chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , thingiverse = require('../lib')
  , _ = require('lodash')
  ;

describe('live tests', function() {
  before(function() {
    if (!process.env.THINGIVERSE_TOKEN) {
      this.skip();
    }
  })

  it('/users/makerbot works', () => {
    return thingiverse('/users/makerbot').then(res => {
      res.body.should.contain({
        id: 928,
        name: 'MakerBot',
        url: 'https://api.thingiverse.com/users/MakerBot',
        public_url: 'https://www.thingiverse.com/MakerBot'
      });
    })
  });

  it('/users/x 404s', () => {
    return thingiverse('/users/x').then(() => {
      throw new Error('Request should 404');
    }).catch(err => {
      err.response.statusCode.should.eq(404);
      thingiverse.getError(err.response).toLowerCase().should.contain.string('not found');
    });
  });

  it('/users/me 401s with bad token', () => {
    return thingiverse('/users/me', { token: 'abc' }).then(() => {
      throw new Error('Request should 401');
    }).catch(err => {
      err.response.statusCode.should.eq(401);
      thingiverse.getError(err.response).toLowerCase().should.contain.string('unauthorized');
    });
  });

  it('/users/makerbot/things works', () => {
    return thingiverse('/users/makerbot/things').then(res => {
      res.body.should.be.an('array').with.length.gt(0);
    });
  });

  it('/users/:username/avatar-image returns an upload link', () => {
    return thingiverse('users/me').then(res => {
      return thingiverse.post(`users/${res.body.name}/avatar-image`, {
        body: { filename: 'new-avatar.jpg' }
      });
    }).then(res => {
      res.body.should.contain.keys(['action', 'fields']);
      res.body.fields.should.contain.keys(['AWSAccessKeyId', 'bucket', 'key']);
    })
  })

  it('/users/:username/cover-image returns an upload link', () => {
    return thingiverse('users/me').then(res => {
      return thingiverse.post(`users/${res.body.name}/cover-image`, {
        body: { filename: 'new-cover.jpg' }
      });
    }).then(res => {
      res.body.should.contain.keys(['action', 'fields']);
      res.body.fields.should.contain.keys(['AWSAccessKeyId', 'bucket', 'key']);
    })
  })
});
