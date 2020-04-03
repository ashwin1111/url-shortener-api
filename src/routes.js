var express = require('express');
var app = express();

require('./jobs/checkExpiredUrl');

const cors = require('cors');
app.use(cors());

app.use('/', require('./redirection/redirection'));

app.use('/auth', require('./auth/authController'));

app.use('/url/permanent', require('./urlShortner/urlShortner'));

app.use('/url/temporary', require('./urlShortner/tempUrlShortner'));

app.use('/url/availability', require('./urlShortner/checkAvailability'));

app.use('/collections', require('./collections/collection'));

app.use('/collections/update', require('./collections/updateCollection'));

app.use('/profile', require('./profile/profile'));

module.exports = app;