/**
 * Created by drouar_b on 29/09/2017.
 */

const express = require('express');
const router = express.Router();
const oauth = require('../core/oauth');
const endpoints = require('../core/endpoints');

router.all('/oauth/token', oauth.token);
router.all('/authorise', oauth.postAuthorise);

router.get('/token/:token', oauth.authenticate, endpoints.token);
router.get('/user/:user', oauth.authenticate, endpoints.user);

module.exports = router;