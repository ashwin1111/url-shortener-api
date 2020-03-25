var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const pool = require('../db/postgres');

router.post('/', async (req, result) => {
    var shortId = process.env.api_url_heroku + '/' + req.body.customShortUrl;
    console.log('shortIdshortId', shortId);
    const client = await pool().connect()
    await JSON.stringify(client.query(`select * from url where short_url=$1`,
        [shortId], async function (err, res) {
            if (err) {
                console.log('err in retreaving short url', err);
                return result.status(500).send({
                    auth: false,
                    token: 'Anonymous user',
                    msg: 'Internal error'
                });
            } else if (res.rowCount > 0) {

                return result.status(200).send({
                    availability: false
                });
            } else if (res.rowCount === 0) {

                return result.status(200).send({
                    availability: true
                });
            }
        }));
    client.release();
});

module.exports = router;