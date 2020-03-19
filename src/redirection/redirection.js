var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const { Pool } = require('pg')
const pool = new Pool({
    user: `${process.env.user}`,
    host: `${process.env.host}`,
    database: `${process.env.database}`,
    password: `${process.env.password}`,
    port: '5432',
    ssl: true
});

router.get('/:shortUrl', async (req, result) => {
    var shortUrl;
    if (process.env.PORT) {
        shortUrl = process.env.api_url_heroku + '/' + req.params.shortUrl;
    } else {
        shortUrl = process.env.api_url_local + '/' + req.params.shortUrl;
    }
    const client = await pool.connect()
    await JSON.stringify(client.query(`select * from url where short_url = $1`,
        [shortUrl], async function (err, res) {
            if (err) {
                console.log('err in retreaving url', err);
                return result.status(500).send('err in retreaving url');
            } else {
                if (res.rows[0]) {
                    var bigUrl = res.rows[0].big_url;

                    return result.redirect(bigUrl);
                } else {
                    return result.status(500).send('err in retreaving url');
                }
            }
        }));
    client.release();
});

module.exports = router;