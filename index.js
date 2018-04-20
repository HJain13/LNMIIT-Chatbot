const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const api = require('./api/routes');
const fs = require('fs');

// Initialising App
var app = express();
app.use(cors());
app.use(compression());
app.listen(4000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(function(req, res, next) {
	req.headers['if-none-match'] = 'no-match-for-this';
	next();    
});

// Creating the Database
function getPrecedingValue(match){
	return ' ' + match[match.length - 1];
}

fs.readFile('./data/content.txt', 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Reading Content from Data Folder.');        
        const content = data;
        var processedContent = content.replace(/\[\d\]/g, '').replace(/\. [a-z]/g,getPrecedingValue).replace(/[\n\r]/g, ' ');
        var sentences = processedContent.split('. ');
        console.log('Processing!');        
        fs.writeFile('./data/processed.txt', JSON.stringify(sentences), 'utf8', (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Processed content was Saved!');
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
