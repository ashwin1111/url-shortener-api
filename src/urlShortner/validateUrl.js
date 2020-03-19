var validUrl = require('valid-url');

function validateUrl(req, res, next) {
    var bigUrl = req.body.url;

    if (!validUrl.isUri(bigUrl)) {
        console.log('Not a valid URL', bigUrl);
        return res.status(500).send({
            auth: true,
            token: true,
            message: 'Not a valid URL'
        });
    }

    next();
}

module.exports = validateUrl;