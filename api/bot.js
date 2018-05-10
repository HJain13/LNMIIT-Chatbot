const express = require('express');
const natural = require('natural');
const sw = require('stopword');
const Lemmer = require('lemmer');
const fs = require('fs');
var api = express.Router();


api.result = function(req, res, next) {
	var query = req.params.query.toLowerCase();
	console.log(query);
	//Getting Databse
	fs.readFile('./data/processed.txt', 'utf8', (err, data) => {
		if (err) {
			console.log(err);
		} else {
			var sentences = JSON.parse(data);
			var queryTerms = sw.removeStopwords(query.split(' '));
			Lemmer.lemmatize(queryTerms).then(function (queryTerms){
				console.log(queryTerms);
				var score, scores = [];
				for(var i = 0; i < sentences.length; i++){
					score = 1 - 0.01*(i+1);
					for(var j = 0; j < queryTerms.length; j++){
						if(sentences[i].toLowerCase().search(queryTerms[j]) != -1) {
							score++;
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
						//Sorting
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
			
						res.status(200).send({
							'best_answer': {'answer': sentences[0], 'score': scores[0]},
							'answers': answer
						});
					}
				});				
			});
		}
	});
};

module.exports = api;