const redis = require("redis");
const client = redis.createClient(process.env.redisURI);

client.on("error", function (error) {
    console.error('error in redis', error);
});

module.exports = () => { return client; }