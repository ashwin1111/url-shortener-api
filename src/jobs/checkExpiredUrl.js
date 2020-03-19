const cron = require('node-cron');
const pool = require('../db/postgres');

cron.schedule('0 */12 * * *', async() => {
// cron.schedule('46 19 * * *', async() => {
    console.log('job is running');
    const client = await pool().connect();
    client.query(`delete from url where expiry < NOW()`, async function (err, res) {
        console.log(`deleted `+ res.rowCount+ ` expired url's`);
    })
});