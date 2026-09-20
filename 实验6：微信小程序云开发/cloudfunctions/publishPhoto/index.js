'use strict';

const cloud = require('wx-server-sdk');
const { createPublishPhotoHandler } = require('./handler');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = createPublishPhotoHandler(cloud);
