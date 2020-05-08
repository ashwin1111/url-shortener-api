var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const pool = require('../db/postgres');

const redisClient = require('../db/redis');

let wakeUpCounter = 0;

router.get('/', (req, res) => {
    res.redirect('https://app.urlll.xyz');
});

router.get('/wakeup', (req, res) => {
    res.send('thanks for waking me up ' + wakeUpCounter++ + 'th time');
});

router.get('/:shortUrl', async (req, result) => {
    var shortUrl = req.params.shortUrl;

    redisClient().get(shortUrl, async(err, data) => {
        if (data !== null) {
            console.log('returning data from cache');
            incrementClicks(shortUrl);
            return result.redirect(data);
        } else {
            const client = await pool().connect();
            await client.query(`select * from url where short_url = $1`,
                [shortUrl], async function (err, res) {
                    if (err) {
                        console.log('err in retreaving url', err);
                        return result.status(500).send('err in retreaving url');
                    } else {
                        if (res.rows[0]) {
                            var bigUrl = res.rows[0].big_url;
                            redisClient().setex(shortUrl, 86400, bigUrl);

                            incrementClicks(shortUrl);
                            return result.redirect(bigUrl);
                        } else {
                            return result.status(500).send('err in retreaving url');
                        }
                    }
                });
            client.release();
        }
    });

    async function incrementClicks(shortUrl) {
        const client = await pool().connect();
        await client.query(`update url set clicks = clicks + 1 where short_url = $1`,
            [shortUrl], async function (err, res) {
                if (err) {
                    console.log('err in incrementing clicks', err);
                }
            });
        client.release();
    };
});

module.exports = router;