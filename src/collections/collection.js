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
    await client.query(`select * from collections where name = $1`,
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
    var { name, title, description, url_id_collection } = req.body;
    if (!req.body.name || !req.body.title || !req.body.description || !req.body.url_id_collection) {
        return result.status(403).send({
            msg: "Bad payload"
        });
    }

    var id = await uuidv4();
    client = await pool().connect();
    await client.query(`INSERT INTO collections (id, name, title, description, email, created_at, url_id_collection) VALUES ($1, $2, $3, $4, $5, now(), $6)`,
        [id, name, title, description, req.token.email, url_id_collection], async function (err, res) {
            if (err) {
                console.log('err in creating collection', err);
                return result.status(500).send({
                    msg: 'Internal error'
                });
            } else {
                return result.status(200).send({
                    msg: 'Collection created'
                });
            }
        });
        client.release();
});

router.get('/:collectionName', async (req, result) => {
    return result.redirect('https://app.urlll.xyz/collections/' + req.params.collectionName);
    // return result.redirect('http://localhost:4200/collections/' + req.params.collectionName);
});

router.get('/list/:collectionName', async (req, result) => {
    client = await pool().connect();

    await client.query(`select * from extended_collections where collection_name = $1`, [req.params.collectionName], async function (err, res) {
        if (err) {
            client.release();
            console.log('err in retreaving collections', err);
            return result.status(500).send('err in retreaving collections');
        } else {
            if (res.rowCount < 1) {
                client.release();
                return result.status(200).send({
                    collections: "No links found in the given collection name"
                })
            }

            incrementClicks(req.params.collectionName);
            return result.status(200).send({
                collections: res.rows
            });
        }
    })

    async function incrementClicks(collectionName) {
        await client.query(`update collections set clicks = clicks + 1 where name = $1`,
            [collectionName], async function (err, res) {
                if (err) {
                    console.log('err in incrementing clicks', err);
                }
            });
        client.release();
    };
})

router.get('/my_collections/all', jwtToken, async (req, result) => {
    client = await pool().connect();

    await client.query(`select collection_name,collection_title,collection_description,collection_created_at from extended_collections 
    where collection_owner_email= $1 group by collection_name,collection_title,collection_description,collection_created_at order by
    collection_created_at desc`, 
    [req.token.email], async function (err, res) {
        if (err) {
            console.log('err in selecting collection list', err);
            console.log('releasing client');
            client.release();
            return result.status(500).send({
                msg: "Internal error"
            })
        } else {
            if (res.rowCount < 1) {
                console.log('releasing client');
                client.release();
                return result.status(200).send({
                    msg: "User have not created any collections yet"
                })
            } else {
                console.log('releasing client');
                client.release();
                return result.status(200).send({
                    collections: res.rows
                });
            }
        }
    });
})

module.exports = router;