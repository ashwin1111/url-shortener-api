const dotenv = require('dotenv')
dotenv.config()

var app = require('./src/routes');
var port = process.env.PORT || 3333;

var server = app.listen(port, function() {
    console.log('URL Shortner is listening on port ' + port);
});