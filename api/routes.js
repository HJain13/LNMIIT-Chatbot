var express = require('express');
var bot = require('./bot');
var wikibot = require('./wikibot');
var api = express.Router();

api.get('/answer/:query', bot.result);
api.get('/answerv2/:query', wikibot.result);

module.exports = api;
