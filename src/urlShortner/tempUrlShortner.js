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

var validateUrl = require('./validateUrl');

router.post('/random', validateUrl, async (req, result) => {
    var shortUrl;
    if (process.env.PORT) {
        shortUrl = process.env.api_url_heroku + '/' + randomize('a0', 4);
    } else {
        shortUrl = process.env.api_url_local + '/' + randomize('a0', 4);
    }
    var bigUrl = req.body.url;
    var expiryTime = new Date(new Date().setDate(new Date().getDate() + 7));
    var id = await uuidv4();
    const client = await pool().connect()
    await client.query(`INSERT INTO url (id, big_url, short_url, created_at, expiry) VALUES ($1, $2, $3, now(), NOW() + INTERVAL '7 DAY')`,
        [id, bigUrl, shortUrl], async function (err, res) {
            if (err) {
                console.log('err in creating short url', err);
                return result.status(500).send({
                    auth: false,
                    token: 'Anonymous user',
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
                    token: 'Anonymous user',
                    msg: data
                });
            }
        });
    client.release();
});

router.post('/custom', validateUrl, async function (req, result) {
    var shortUrl;
    if (process.env.PORT) {
        // shortUrl = process.env.api_url_heroku + '/' + req.body.customShortUrl;
        // have to check
        shortUrl = 'urlll.xyz/' + req.body.customShortUrl;
    } else {
        shortUrl = process.env.api_url_local + '/' + req.body.customShortUrl;
    }
    var bigUrl = req.body.url;
    var expiryTime = new Date(new Date().setDate(new Date().getDate() + 7));
    var id = await uuidv4();
    const client = await pool().connect()
    await JSON.stringify(client.query(`INSERT INTO url (id, big_url, short_url, created_at, expiry) VALUES ($1, $2, $3, now(), NOW() + INTERVAL '7 DAY')`,
        [id, bigUrl, shortUrl], async function (err, res) {
            if (err) {
                console.log('err in creating short url', err);
                return result.status(500).send({
                    auth: false,
                    token: 'Anonymous user',
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
                    token: 'Anonymous user',
                    msg: data
                });
            }
        }));
    client.release();
});

module.exports = router;