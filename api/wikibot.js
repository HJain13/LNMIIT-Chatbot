const express = require('express');
const natural = require('natural');
const sw = require('stopword');
const Lemmer = require('lemmer');
const fs = require('fs');
const metaphone = natural.Metaphone;
var WordPOS = require('wordpos');
var wordpos = new WordPOS();
var api = express.Router();
var abBuilder = require('../tools/abBuilder.js');

// =============== Building Result API ================ //

api.result = function(req, res, next) {
	var query = req.params.query.toLowerCase();
	query = query.replace(/!.\?/g, "");
	let queryNER = query;
	console.log("Answering: " + query);
	
	var queryTerms = sw.removeStopwords(query.split(' '));
	console.log(queryTerms);
	var answerBank = new Set();
	var querySynonyms = [];
	var synPromises = [];
	
	var greetings = ['hey', 'hello', 'hi'];
	// Handling Salutations
	if(greetings.indexOf(queryTerms[0]) != -1){
		res.status(200).send({
			'best_answer': {'answer': 'Hello! Nice to Meet You 😊', 'score': 100}
		});		
	} else if (query == "whats up"){
		res.status(200).send({
			'best_answer': {'answer': 'Nothing Much, You say!', 'score': 100}
		});		
	} else if (query == "how are you"){
		res.status(200).send({
			'best_answer': {'answer': 'I am feeling great since I started talking with you! 😂', 'score': 100}
		});		
	} else {
		//Getting Databse
		fs.readFile('./data/ner.json', 'utf8', (err, data) => {
			if (err) {
				console.log(err);
				res.status(200).send({
					"error" : err
				});
			} else {
				var namedEntities = JSON.parse(data);
				({ answerBank, queryNER } = abBuilder.build(namedEntities, query));
				Promise.all(queryTerms.map(async qt => {
					wordpos.lookup(qt,syns => {
						console.log('okay2');
						console.log("Synonym --> "+syns[0].synonyms);
						querySynonyms = querySynonyms.concat(syns[0].synonyms);
					});
				})).then(function(values){
					console.log(queryNER);
					answerBank = Array.from(answerBank);
					res.status(200).send({
						"data" : answerBank
					});
				});
			}
		});
	}
};

module.exports = api;