var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const uuidv4 = require('uuid/v4');

const axios = require('axios');

const pool = require('../db/postgres');

var jwtToken = require('../auth/jwtToken');

var client;

router.post('/availability', jwtToken, async (req, result) => {

    var collectionName = req.body.collectionName;
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

router.post('/add', jwtToken, async (req, result) => {
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
                        console.log('err in updating collection', err);
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
                                msg: 'Collection updated'
                            });
                        }
                        resolve();
                    }
                });
        })
    }

    var { name, title, description, url_id } = req.body;
    client = await pool().connect();
    client.query(`select * from extended_collections where collection_name = $1 and collection_title = $2 and collection_description = $3 and 
    collection_owner_email = $4 and url_owner_email = $4`, [name, title, description, req.token.email], async function (err, res) {
        if (err) {
            console.log('err in retreaving collection during update', err);
            return result.status(500).send({
                msg: 'Internal error'
            });
        } else {
            if (res.rowCount > 0) {
                // check for duplications
                var collection = res.rows;
                var oldIds = [];
                // creating old id array
                collection.forEach(element => {
                    oldIds.push(element.url_id);
                });

                var newIds = [];
                // creating new id array
                for (i in url_id) {
                    newIds.push(url_id[i])
                }

                // concatinating them and checking for duplication
                oldIds = oldIds.concat(newIds);
                for (var i = 0; i < oldIds.length; ++i) {
                    for (var j = i + 1; j < oldIds.length; ++j) {
                        if (oldIds[i] === oldIds[j]) {
                            return result.status(500).send({
                                msg: `Collection already exists for some / many urls`
                            });
                        }
                    }
                }

                let chain = Promise.resolve();
                // transaction
                await client.query('begin');
                for (i in url_id) {
                    chain = chain.then(() => dbOperation(url_id[i], url_id))
                        .then(takeRest)
                }
            } else {
                return result.status(500).send({
                    msg: `Collection details mismatch / User doesn't have any previous collection`
                });
            }
        }
    })
});

router.post('/delete', jwtToken, async (req, result) => {
    var successCount = 0;

    function takeRest() {
        return new Promise(r => setTimeout(r, 100))
    }

    async function dbOperation(url_id, data) {
        return new Promise(async (resolve) => {
            var id = await uuidv4();

            await client.query(`delete from collections where url_id = $1`,
                [data[successCount]], async function (err, res) {
                    if (err) {
                        console.log('err in deleting url in collection', err);
                        await client.query('rollback');
                        return result.status(500).send({
                            msg: 'Internal error'
                        });
                    } else {
                        successCount++;
                        if (Object.keys(data).length === successCount) {
                            await client.query('commit');
                            client.release();
                            return result.status(200).send({
                                msg: 'Selected urls deleted in the collection'
                            });
                        }
                        resolve();
                    }
                });
        })
    }

    var { name, title, description, url_id } = req.body;
    client = await pool().connect();
    client.query(`select * from extended_collections where collection_name = $1 and collection_title = $2 and collection_description = $3 and 
    collection_owner_email = $4 and url_owner_email = $4`, [name, title, description, req.token.email], async function (err, res) {
        if (err) {
            console.log('err in retreaving collection during delete', err);
            return result.status(500).send({
                msg: 'Internal error'
            });
        } else {
            if (res.rowCount > 0) {
                let chain = Promise.resolve();
                // transaction
                await client.query('begin');
                for (i in url_id) {
                    chain = chain.then(() => dbOperation(url_id[i], url_id))
                        .then(takeRest)
                }
            } else {
                return result.status(500).send({
                    msg: `Collection details mismatch / User doesn't have any previous collection`
                });
            }
        }
    })
});

module.exports = router;