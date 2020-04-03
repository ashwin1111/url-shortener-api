var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const uuidv4 = require('uuid/v4');

const randomize = require('randomatic');

const pool = require('../db/postgres');

var jwtToken = require('../auth/jwtToken');

var validateUrl = require('./validateUrl');

router.post('/random', jwtToken, validateUrl, async (req, result) => {
    var shortUrl;
    if (process.env.PORT) {
        // shortUrl = process.env.api_url_heroku + '/' + randomize('a0', 4);
        // have to check
        shortUrl = 'urlll.xyz/' + randomize('a0', 4);
    } else {
        shortUrl = process.env.api_url_local + '/' + randomize('a0', 4);
    }
    var bigUrl = req.body.url;
    var expiryTime = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
    var id = await uuidv4();
    const client = await pool().connect();
    await client.query(`INSERT INTO url (id, big_url, short_url, email, created_at, expiry) VALUES ($1, $2, $3, $4, now(), NOW() + INTERVAL '10 year')`,
        [id, bigUrl, shortUrl, req.token.email], async function (err, res) {
            if (err) {
                console.log('err in creating short url', err);
                return result.status(500).send({
                    auth: false,
                    token: true,
                    msg: 'Internal error'
                });
            } else {
                var data = {
                    short_url: shortUrl,
                    big_url: bigUrl,
                    expiry: expiryTime
                };

                return result.status(200).send({
                    auth: true,
                    token: true,
                    msg: data
                });
            }
        });
    client.release();
});

router.post('/custom', jwtToken, validateUrl, async function (req, result) {
    var shortUrl;
    if (process.env.PORT) {
        // shortUrl = process.env.api_url_heroku + '/' + req.body.customShortUrl;
        // have to check
        shortUrl = 'urlll.xyz/' + req.body.customShortUrl;
    } else {
        shortUrl = process.env.api_url_local + '/' + req.body.customShortUrl;
    }
    var bigUrl = req.body.url;
    var expiryTime = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
    var id = await uuidv4();
    const client = await pool().connect();
    await client.query(`INSERT INTO url (id, big_url, short_url, email, created_at, expiry) VALUES ($1, $2, $3, $4, now(), NOW() + INTERVAL '10 year')`,
        [id, bigUrl, shortUrl, req.token.email], async function (err, res) {
            if (err) {
                console.log('err in creating short url', err);
                return result.status(500).send({
                    auth: false,
                    token: true,
                    msg: 'Internal error'
                });
            } else {
                var data = {
                    short_url: shortUrl,
                    big_url: bigUrl,
                    expiry: expiryTime
                };

                return result.status(200).send({
                    auth: true,
                    token: true,
                    msg: data
                });
            }
        });
    client.release();
});

module.exports = router;