var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const pool = require('../db/postgres');

var jwtToken = require('../auth/jwtToken');

router.post('/url', jwtToken, async (req, result) => {
    var client = await pool().connect();

    await client.query(`select id, big_url, short_url, created_at, title, description from url where email = $1 order by created_at desc`, [req.token.email], async function (err, res) {
        if (err) {
            console.log('err in retreaving urls', err);
            return result.status(500).send('err in retreaving urls');
        } else {
            if (res.rowCount < 1) {
                return result.status(200).send({
                    collections: "User haven't created any short url's yet"
                })
            }

            return result.status(200).send({
                list: res.rows
            });
        }
    })
    client.release();
});

module.exports = router;