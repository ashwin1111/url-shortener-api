var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const uuidv4 = require('uuid/v4');

const pool = require('../db/postgres');

var jwtToken = require('../auth/jwtToken');

var client;

router.post('/availability', jwtToken, async (req, result) => {

    var collectionName = req.body.collectionName;
    if (collectionName.toLowerCase().includes('update')) {
        return result.status(200).send({
            availability: false
        });
    }

    client = await pool().connect();
    await client.query(`select * from extended_collections where collection_name = $1`,
        [collectionName], async function (err, res) {
            if (err) {
                console.log('err in retreaving collection names', err);
                return result.status(500).send({
                    msg: 'Internal error'
                });
            } else {
                if (res.rowCount > 0) {
                    return result.status(200).send({
                        availability: false
                    });
                } else if (res.rowCount === 0) {
                    return result.status(200).send({
                        availability: true
                    });
                }
            }
        });
    client.release();
});

router.post('/create', jwtToken, async (req, result) => {
    var successCount = 0;

    function takeRest() {
        return new Promise(r => setTimeout(r, 100))
    }

    async function dbOperation(url_id, data) {
        return new Promise(async (resolve) => {
            var id = await uuidv4();

            await client.query(`INSERT INTO collections (id, name, title, description, url_id, email, created_at) VALUES ($1, $2, $3, $4, $5, $6, now())`,
                [id, name, title, description, data[successCount], req.token.email], async function (err, res) {
                    if (err) {
                        console.log('err in creating collection', err);
                        await client.query('rollback');
                        return result.status(500).send({
                            auth: false,
                            token: true,
                            msg: 'Internal error'
                        });
                    } else {
                        successCount++;
                        if (Object.keys(data).length === successCount) {
                            await client.query('commit');
                            client.release();
                            return result.status(200).send({
                                msg: 'Collection created'
                            });
                        }
                        resolve();
                    }
                });
        })
    }

    var { name, title, description, url_id } = req.body;
    let chain = Promise.resolve();
    // transaction
    client = await pool().connect();
    await client.query('begin');
    for (i in url_id) {
        chain = chain.then(() => dbOperation(url_id[i], url_id))
            .then(takeRest)
    }
});

router.get('/:collectionName', async (req, result) => {
    var collectionName = req.params.collectionName;
    client = await pool().connect();

    await client.query(`select * from extended_collections where collection_name = $1`, [collectionName], async function (err, res) {
        if (err) {
            console.log('err in retreaving collections', err);
            return result.status(500).send('err in retreaving collections');
        } else {
            if (res.rowCount < 1) {
                return result.status(200).send({
                    collections: "No links found in the given collection name"
                })
            }

            return result.status(200).send({
                collections: res.rows
            });
        }
    })
});

module.exports = router;