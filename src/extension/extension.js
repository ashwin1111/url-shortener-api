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

router.post('/bulk', jwtToken, async (req, result) => {
    let successCount = 0;
    let url_id_collection = '';

    let chain = Promise.resolve();
    let client = await pool().connect();
    for (i in req.body.urls) {
        chain = chain.then(() => createUrls(req.body.urls))
    }

    async function createUrls(urls) {
        return new Promise(async (resolve) => {
            const shortUrl = randomize('a0', 4);
            const id = await uuidv4();
            await client.query(`INSERT INTO url (id, big_url, short_url, email, created_at, expiry, title) VALUES 
            ($1, $2, $3, $4, now(), NOW() + INTERVAL '10 year', $5)`,
                [id, urls[successCount].url, shortUrl, req.token.email, urls[successCount].title], async function (err, res) {
                    if (err) {
                        console.log('err in creating short url from extension', err);
                        console.log('releasing client');
                        client.release();
                        return result.status(500).send({
                            msg: 'Internal error'
                        });
                    } else {
                        console.log('inserted one row', successCount);
                        url_id_collection += id + ',';
                        successCount++;
                        if (Object.keys(urls).length === successCount) {
                            createCollections();
                        }
                        resolve();
                    }
                });
        });
    }

    async function createCollections() {
        console.log('creating collection');
        const id = await uuidv4();
        url_id_collection = url_id_collection.substring(0, url_id_collection.length - 1);
        await client.query(`INSERT INTO collections (id, name, title, description, email, created_at, url_id_collection) VALUES ($1, $2, $3, $4, $5, now(), $6)`,
            [id, req.body.name, req.body.collection_title, req.body.description, req.token.email, url_id_collection], async function (err, res) {
                if (err) {
                    console.log('err in creating collection from extension', err);
                    console.log('releasing client');
                    client.release();
                    return result.status(500).send({
                        msg: 'Internal error'
                    });
                } else {
                    console.log('releasing client');
                    client.release();
                    return result.status(200).send({
                        msg: 'Export success'
                    });
                }
            });
    }
});

module.exports = router;