const express = require("express");
const natural = require("natural");
const sw = require("stopword");
const Lemmer = require("lemmer");
const fs = require("fs");
const metaphone = natural.Metaphone;
const WordPOS = require("wordpos");
const wordpos = new WordPOS();
const api = express.Router();
const abBuilder = require("../tools/abBuilder.js");
const wikiReader = require("../tools/wikiReader.js");

// =============== Building Result API ================ //

api.result = function(req, res, next) {
  let query = req.params.query.toLowerCase();
  query = query.replace(/!.\?/g, "");
  let queryNER = query;
  console.log("Answering: " + query);

  let queryTerms = sw.removeStopwords(query.split(" "));
  console.log(queryTerms);
  let answerBank = [];
  let querySynonyms = [];

  let greetings = ["hey", "hello", "hi"];
  // Handling Salutations
  if (greetings.indexOf(queryTerms[0]) != -1) {
    res.status(200).send({
      best_answer: { answer: "Hello! Nice to Meet You 😊", score: 100 }
    });
  } else if (query == "whats up") {
    res.status(200).send({
      best_answer: { answer: "Nothing Much, You say!", score: 100 }
    });
  } else if (query == "how are you") {
    res.status(200).send({
      best_answer: {
        answer: "I am feeling great since I started talking with you! 😂",
        score: 100
      }
    });
  } else {
    //Getting Databse
    fs.readFile("./data/ner.json", "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.status(200).send({
          error: err
        });
      } else {
        let namedEntities = JSON.parse(data);
        ({ answerBank, queryNER } = abBuilder.build(namedEntities, query));
        let queryNERTerms = sw
          .removeStopwords(queryNER.split(" ")) // Removes Stop Words, duh :D
          .filter(Boolean); // Filters empty strings, null etc. Basically any falsy value
        let content = [];
        Promise.all(
          answerBank.map(
            async path => await wikiReader.read("./data/repo/" + path)
          )
        )
          .then(function(result) {
            content = result;
            // console.log('The content is: '+result);
            Promise.all(
              queryNERTerms.map(async qt => {
                await wordpos.lookup(qt, syns => {
                  console.log(
                    "Synonym --> " + JSON.stringify(syns[0].synonyms)
                  );
                  querySynonyms = querySynonyms.concat(
                    syns[0].synonyms.filter(synonym => synonym != qt) // Filters original word from synonyms
                  );
                });
              })
            ).then(function() {
              console.log(querySynonyms);
              console.log(queryNERTerms);
              let scores = [];
              content.forEach(source => {
                let sentences = source.split(". ");
                // console.log(sentences);
                sentences.forEach((sentence, sIndex) => {
                  let score = 1 - 0.01 * (sIndex + 1);
                  queryNERTerms.forEach(qt => {
                    if (sentence.toLowerCase().search(qt) != -1) {
                      score++;
                    } else {
                      let words = sentence.split(" ");
                      words.forEach(word => {
                        if (metaphone.compare(word, qt)) {
                          score += 0.8;
                          console.log(`Matched ${word} & ${qt}`);
                        }
                      });
                    }
                  });
                  scores.push([sentence, score.toPrecision(3)]);
                });
              });
              scores.sort((a, b) => b[1] - a[1]);
              if (scores[0][1] < 1) {
                //handling apology
                res.status(200).send({
                  best_answer: {
                    answer: "I couldn't find any relevant answer! 😞",
                    score: scores[0]
                  },
                  answers: scores
                });
              } else {
                res.status(200).send({
                  best_answer: { answer: scores[0][0], score: scores[0][1] },
                  answers: scores
                });
              }
              // res.status(200).send({
              // 	"data" : answerBank
              // });
            });
          })
          .catch(() => {
            console.log("There was an error in reading the Answer Bank 😢");
          });
      }
    });
  }
};

module.exports = api;
