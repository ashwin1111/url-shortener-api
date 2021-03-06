var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const pool = require('../db/postgres');

router.post('/', async (req, result) => {
    console.log('checking availability for ', req.body.customShortUrl);
    // var shortId = process.env.api_url_heroku + '/' + req.body.customShortUrl;
    // have to check
    if (req.body.customShortUrl.toLowerCase().includes('verify')) {
        return result.status(200).send({
            availability: false
        });
    }
 
    const client = await pool().connect()
    await client.query(`select * from url where short_url=$1`,
        [req.body.customShortUrl], async function (err, res) {
            if (err) {
                console.log('err in retreaving short url', err);
                return result.status(500).send({
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
        });
    client.release();
});

module.exports = router;