var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

var validator = require('email-validator');

const uuidv4 = require('uuid/v4');

const dotenv = require('dotenv')
dotenv.config()

var jwtToken = require('./jwtToken');
var sendEmail = require('./verifyEmail');

const pool = require('../db/postgres');

router.post('/register', async function (req, res) {
    if (req.body.name === '' || req.body.email === '' || req.body.password === '') {
        return res.status(403).send({
            auth: false,
            token: null,
            msg: "Bad payload"
        });
    }

    if (!validator.validate(req.body.email)) {
        return res.status(404).send({
            auth: false,
            token: null,
            msg: "Email badly formatted"
        });
    }

    const client = await pool().connect();
    await JSON.stringify(client.query('SELECT id FROM url_shortner_users WHERE "email"=$1', [req.body.email], async function (err, result) {
        if (result.rows[0]) {
            return res.status(403).send({
                auth: false,
                token: null,
                msg: "Email already exists"
            });
        } else {
            var id = await uuidv4();
            var pwd = await bcrypt.hashSync(req.body.password, 8);
            client.query('INSERT INTO url_shortner_users (id, name, email, "password", created_at) VALUES ($1, $2, $3, $4, now())', [id, req.body.name, req.body.email, pwd], function (err, result) {
                if (err) {
                    console.log('err in registering user', err);
                    return res.status(500).send({
                        auth: false,
                        token: null,
                        msg: 'Internal error / Bad payload'
                    })
                } else {
                    sendEmail(req.body.name, id, req.body.email);
                    return res.status(200).send({
                        auth: true,
                        token: null,
                        msg: 'User registered successfully'
                    });
                }
            });
        }
    }));
    client.release();
});

router.post('/login', async function (req, res) {
    if (req.body.name === '' || req.body.email === '' || req.body.password === '') {
        return res.status(403).send({
            auth: false,
            token: null,
            msg: "Bad payload"
        });
    }
    const client = await pool().connect()
    await JSON.stringify(client.query('SELECT * FROM url_shortner_users WHERE "email"=$1', [req.body.email], function (err, result) {
        if (!result.rows[0]) {
            return res.status(404).send({
                auth: false,
                token: null,
                msg: "No user found with the given email / password"
            })
        } else {
            var encryptedPassword = result.rows[0].password;
            var passwordIsValid = bcrypt.compareSync(req.body.password, encryptedPassword);
            if (!passwordIsValid) return res.status(404).send({
                auth: false,
                token: null,
                msg: 'Email / Password is wrong'
            });

            if (result.rows[0].verified === true) {
                var token = jwt.sign({
                    id: result.rows[0].id,
                    email: req.body.email
                }, process.env.jwtSecret, {
                    expiresIn: 86400
                });

                return res.status(200).send({
                    auth: true,
                    token: token,
                    msg: 'Login success :)'
                });
            } else {
                return res.status(404).send({
                    auth: false,
                    token: null,
                    msg: 'Account not verified'
                });
            }
        }
    }));
    client.release();
});

router.get('/verify', async function (req, res, next) {
    try {
        const id = req.query.id;
        const client = await pool().connect()
        await JSON.stringify(client.query('SELECT id FROM url_shortner_users WHERE id=$1', [id], async function (err, result) {
            if (result.rows[0] && id === result.rows[0].id) {
                await JSON.stringify(client.query('update url_shortner_users set verified = true where id=$1', [id], async function (err, result) {
                    res.redirect('https://app.urlll.xyz/verified');
                }))
            } else {
                return res.status(404).send({
                    auth: true,
                    token: null,
                    msg: 'No user for the given id'
                });
            }
        }));
        client.release();
    } catch (e) {
        throw (e)
    }
});

router.get('/me', jwtToken, async function (req, res, next) {
    try {
        const client = await pool().connect();
        await JSON.stringify(client.query('SELECT * FROM url_shortner_users WHERE id=$1', [req.token.id], function (err, result) {
            if (result.rows[0]) {
                return res.status(200).send({
                    auth: true,
                    token: null,
                    msg: result.rows[0]
                });
            } else {
                return res.status(500).send({
                    auth: false,
                    token: null,
                    msg: 'There was a problem finding the user'
                });
            }
        }));
        client.release();
    } catch (e) {
        throw (e)
    }
});

router.post('/refresh_token', async function (req, res) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({
            auth: false,
            token: null,
            message: 'No token provided.'
        });
    } else {
        jwt.verify(token, process.env.jwtSecret, function (err, decoded) {
            if (err && err.name === 'TokenExpiredError') {
                var token = jwt.sign({
                    id: req.body.email
                }, process.env.jwtSecret, {
                    expiresIn: 86400
                });
                return res.status(200).send({
                    auth: true,
                    token: token,
                    msg: 'Token refreshed :)'
                });
            } else if (err) {
                return res.status(500).send({
                    auth: false,
                    token: null,
                    message: 'Failed to authenticate token.'
                });
            }
        });
    }
});

router.get('/logout', jwtToken, function (req, res) {
    res.status(200).send({
        auth: false,
        token: null,
        msg: 'User signed out, bubyee :)'
    });
});

module.exports = router;