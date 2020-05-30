const cron = require('node-cron');
const axios = require('axios');

cron.schedule('*/20 * * * *', async () => {
    // runs every 20 minutes
    websiteHealthChecker();
});

async function websiteHealthChecker() {
    axios.get('https://webpage-details.herokuapp.com/get_page_details?web_address=http://polydimensional.in').then(async (res) => {
        console.log(res.data.data.meta_data[0]);
        if (res.data.data.meta_data[0] === 'We at polydimensional believe that to truly understand technology you need to build it while you learn') {
            // website seems to be good
            axios.get('https://polydimensional-notifications.herokuapp.com/alert?msg=Website Health is good'); 
        } else {
            axios.get('https://polydimensional-notifications.herokuapp.com/alert?msg=Something seems to be fucked up, website is down'); 
        }
    }).catch(err => {
        console.log(`Thatha's API didnt answer`);
        axios.get(`https://polydimensional-notifications.herokuapp.com/alert?msg=Thatha's is down`); 
    })

}