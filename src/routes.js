var express = require('express');
var app = express();
app.use(express.static('public'));

var job = require('./jobs/checkExpiredUrl');

const cors = require('cors');
app.use(cors());

app.use('/', require('./redirection/redirection'));

app.use('/auth', require('./auth/authController'));

app.use('/url/permanent', require('./urlShortner/urlShortner'));

app.use('/url/temporary', require('./urlShortner/tempUrlShortner'));

module.exports = app;