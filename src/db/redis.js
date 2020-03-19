const redis = require("redis");
const client = redis.createClient(process.env.redisURI);

client.on("error", function (error) {
    console.error('error in redis', error);
});

// client.del('http://localhost:3333/ashwin');

// client.keys('*', function (err, keys) {
//     for (var i = 0, len = keys.length; i < len; i++) {
//         console.log(keys[i]);
//     }
// });

module.exports = () => { return client; }