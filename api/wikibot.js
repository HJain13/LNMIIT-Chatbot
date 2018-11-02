const express = require('express');
const natural = require('natural');
const sw = require('stopword');
const Lemmer = require('lemmer');
const fs = require('fs');
const metaphone = natural.Metaphone;
var WordPOS = require('wordpos');
var wordpos = new WordPOS();
var api = express.Router();

// =============== Building Result API ================ //

api.result = function(req, res, next) {
	console.log("Starting answering!!");

	var querySynonyms = [];
	var synPromises = [];
	
	// Changing query to lower case, to make matching case insensitive
	var query = req.params.query.toLowerCase();
	query = query.replace(/!.\?/g, "");
	console.log(query);
	// Splitting Query sentence in a group of words
	var queryTerms = sw.removeStopwords(query.split(' '));
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
		fs.readFile('./data/processed.txt', 'utf8', (err, data) => {
			if (err) {
				console.log(err);
			} else {
				var sentences = JSON.parse(data);
				queryTerms.forEach((qt) => {
					wordpos.lookup(qt,syns => {
						console.log('okay');
						synPromises.push(new Promise(function(resolve, reject) {
							console.log("Synonym --> "+syns[0].synonyms);
							querySynonyms.concat(syns[0].synonyms);
							resolve(1);
						}));			
					});
				});
				Promise.all(synPromises).then(function(){
					// Lemmatizing all the query terms
					Lemmer.lemmatize(queryTerms).then(function (queryTerms){
						console.log(queryTerms);
						console.log(querySynonyms);
						var score, scores = [];
						for(var i = 0; i < sentences.length; i++){
							score = 1 - 0.01*(i+1);
							for(var j = 0; j < queryTerms.length; j++){
								// console.log("hey");
								if(sentences[i].toLowerCase().search(queryTerms[j]) != -1) {
									score++;
								} else {
									var words = sentences[i].split(" ");
									words.forEach((word) => {
										if(metaphone.compare(word, queryTerms[j])){
											score += 0.8;
											// console.log("same sound --> "+word+','+queryTerms[j]);
										}
									});
								}
							}
							scores.push(score.toPrecision(3));
						}	
		
						fs.readFile('./data/sentences.txt', 'utf8', (err, data) => {
							if (err) {
								console.log(err);
							} else {
								var sentences = JSON.parse(data);
								var temp;
								//Sorting while keeping score and sentence index same
								for(var i = 0; i < sentences.length-1; i++){
									for(var j = 0; j < sentences.length-i-1; j++){
										if(scores[j] < scores[j+1]){
											temp = scores[j]
											scores[j] = scores[j+1];
											scores[j+1] = temp;
											temp = sentences[j]
											sentences[j] = sentences[j+1];
											sentences[j+1] = temp;
										}
									}
								}
					
								var answer = {};
								sentences.forEach((sentence,index) => {
									answer[sentence] = scores[index];
								});
								
								if(scores[0] < 1){
									//handling apology
									res.status(200).send({
										'best_answer': {'answer': 'I couldn\'t find any relevant answer! 😞', 'score': scores[0]},
										'answers': answer
									});
								} else {
									res.status(200).send({
										'best_answer': {'answer': sentences[0], 'score': scores[0]},
										'answers': answer
									});
								}
							}
						});				
					});
				});
			}
		});
	}
};

module.exports = api;