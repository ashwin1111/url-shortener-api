const cron = require('node-cron');
const pool = require('../db/postgres');
const axios = require('axios');

cron.schedule('0 */1 * * *', async() => {
    scrapData();
});

async function scrapData () {

    var successCount = 0;

    function takeRest() {
        return new Promise(r => setTimeout(r, 100))
    }

    async function dbOperation(rows) {
        return new Promise(async (resolve) => {
            axios.get('https://webpage-details.herokuapp.com/get_page_details?web_address=' + rows[successCount].big_url).then(async(res) => {
                await client.query(`update url set title = $1, description = $2, last_updated_at = now() where id = $3`,
                [res.data.data.title[0], res.data.data.meta_data[0] || res.data.data.first_p_tag[0], rows[successCount].id], async function (err, res) {
                    if (err) {
                        console.log('err in updating scrap data', err);
                    } else {
                        successCount++;
                        console.log('updated 1 scraped data');
                        axios.get('https://ashwin1111.herokuapp.com/telegram?msg=' + `updated scraped data` + res.data.data.title[0]);
                        if (rows.length === successCount) {
                            client.release();
                        }
                        resolve();
                    }
                });
            }).catch(err => {
                successCount++;
                console.log(`Thatha's API didnt answer for ` + rows[successCount].big_url + ' err ' + err);
                resolve();
            })
        })
    }

    async function createChain(res) {
        let chain = Promise.resolve();
        for (i in res.rows) {
            chain = chain.then(() => dbOperation(res.rows))
                .then(takeRest)
        }
    }
    client = await pool().connect();
    client.query(`select * from url where description is null`, async function (err, res) {
        if (err) {
            console.log('err in retreaving url scrap jobs');
        } else if (res.rowCount < 1) {
            console.log('all row has description and title');
        } else {
            createChain(res);
        }
    });
}