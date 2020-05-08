var jwt = require('jsonwebtoken');

const dotenv = require('dotenv')
dotenv.config()

function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'];

    if (!token)
        return res.redirect('https://app.urlll.xyz/redirect/session-expired');

    jwt.verify(token, process.env.jwtSecret, function (err, decoded) {
        if (err && err.name === 'TokenExpiredError') {
            return res.redirect('https://app.urlll.xyz/redirect/session-expired');
        } else if (err) {
            console.log('Failed to authenticate token',err);
            return res.redirect('https://app.urlll.xyz/redirect/session-expired');
        }

        req.token = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    });
}

module.exports = verifyToken;