const cron = require('node-cron');
const pool = require('../db/postgres');
const axios = require('axios');

cron.schedule('0 */12 * * *', async() => {
// cron.schedule('46 19 * * *', async() => {
    const client = await pool().connect();
    client.query(`delete from url where expiry < NOW()`, async function (err, res) {
        axios.get('https://ashwin1111.herokuapp.com/telegram?msg=' + `deleted `+ res.rowCount+ ` expired url's\n\n\n`);
        console.log(`deleted `+ res.rowCount+ ` expired url's`);
    })
});