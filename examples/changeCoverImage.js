'use strict';

if (!process.env.THINGIVERSE_TOKEN) throw new Error('Missing process.env.THINGIVERSE_TOKEN');
if (!process.env.IMAGE_PATH) throw new Error('Missing process.env.IMAGE_PATH');

const fs = require('fs')
const _ = require('lodash')
const thingiverse = require('./lib')
const filePath = process.env.IMAGE_PATH;
const filename = require('path').basename(filePath);

thingiverse('users/me').then(res => {
  return thingiverse.post(`users/${res.body.name}/cover-image`, {
    body: { filename }
  });
}).then(res => {
  return thingiverse.fileUpload(res.body.action, _.assign({}, res.body.fields, {
    file: fs.createReadStream(filePath)
  }), {})
}).then(res => {
  console.log(res.body);
}).catch(err => {
  console.log('Error!', err);
})
