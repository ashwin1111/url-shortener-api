const redis = require("redis");
const client = redis.createClient(process.env.redisURI);

client.del('value');

client.keys('*', function (err, keys) {
    for (var i = 0, len = keys.length; i < len; i++) {
        console.log(keys[i]);
    }
});