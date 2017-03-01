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
    });
  });

  it('/users/makerbot/things works', () => {
    return thingiverse('/users/makerbot/things').then(res => {
      res.body.should.be.an('array').with.length.gt(0);
    });
  });
});
