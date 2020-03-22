var express = require('express');
var app = express();

var job = require('./jobs/checkExpiredUrl');

const cors = require('cors');
app.use(cors());

app.use('/', require('./redirection/redirection'));

app.use('/auth', require('./auth/authController'));

app.use('/url/permanent', require('./urlShortner/urlShortner'));

app.use('/url/temp', require('./urlShortner/tempUrlShortner'));

module.exports = app;