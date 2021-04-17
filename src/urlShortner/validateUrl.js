var validUrl = require('valid-url');

function validateUrl(req, res, next) {
    var bigUrl = req.body.url;

    if (bigUrl.toLowerCase().includes('url-shortener--api.herokuapp.com')) {
        return res.status(500).send({
            msg: 'Not a valid URL'
        });
    }

    if (!validUrl.isUri(bigUrl)) {
        console.log('Not a valid URL', bigUrl);
        return res.status(500).send({
            msg: 'Not a valid URL'
        });
    }

    next();
}

module.exports = validateUrl;