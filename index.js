const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const sw = require('stopword');
const natural = require('natural');
const Lemmer = require('lemmer');
const api = require('./api/routes');
const fs = require('fs');

// ========================= Initialising App ========================= //
var app = express();
app.use(cors());
app.use(compression());
// Assigning the app a Port
app.listen(4000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(function(req, res, next) {
	req.headers['if-none-match'] = 'no-match-for-this';
	next();    
});

// ========================= Creating the Database ========================= //

// Function to get charachter before '.'
function getPrecedingValue(match){
	return ' ' + match[match.length - 1];
}

// Reading the unstructured data from storage
fs.readFile('./data/content.txt', 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Reading Content from Data Folder.');        
        const content = data;
        // Removing attributions as well as period for short forms
        var processedContent = content.replace(/\[\d\]/g, '').replace(/\. [a-z]/g,getPrecedingValue).replace(/[\n\r]/g, ' ');
        // ==> Necessary when splitting sentences on basis of period
        var sentences = processedContent.split('. ');
        console.log('Breaking Into Sentences!');        
        // saving semi processed data to file storage
        fs.writeFile('./data/sentences.txt', JSON.stringify(sentences), 'utf8', (err) => {
            if (err) {
                console.log(err);
            } else {
                var procesedSentences = [], pSentence, pSentStem = [];
                console.log('All sentences were Saved!');
                sentences.forEach(function (sentence, index){
                    pSentStem = [];
                    // Removing stopwords from word array of Sentence split using space
                    pSentence = sw.removeStopwords(sentence.replace(/,/g,'').split(' '));   
                    // Lemmatize words of the sentence             
                    Lemmer.lemmatize(pSentence, function(err, words){
                        pSentStem = words;
                        // Converting the array back to a string separated by space
                        pSentence = pSentStem.join(" ")
                        procesedSentences[index] = pSentence;              
                        fs.writeFile('./data/processed.txt', JSON.stringify(procesedSentences), 'utf8', (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Sentence['+index+'] processing successful!');                
                            }
                        });                        
                    });
                });
            }
        });
    }
});


app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api);

app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({ message: err.message, error: err });
    console.log(err);
});

module.exports = app;
