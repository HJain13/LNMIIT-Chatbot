var express = require('express');
var bot = require('./bot');
var api = express.Router();

api.get('/answer/:query', bot.result);

module.exports = api;
