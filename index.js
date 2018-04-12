const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const api = require('./api/routes');

// Initialising App
var app = express();
app.use(cors());
app.use(compression());
app.listen(4000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);

app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({ message: err.message, error: err });
    console.log(err);
});

module.exports = app;
