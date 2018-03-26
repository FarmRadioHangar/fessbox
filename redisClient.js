var appConfig = require("./etc/app.json");
var logger = new (require("./logger"))(__filename, false);
var redis = require("redis"),
	redisClient = redis.createClient({ db: process.env.hasOwnProperty('REDIS_DB') ? process.env.REDIS_DB : appConfig.redisDB });

redisClient.on("error", (err) => {
	logger.error("redis-error", JSON.stringify(err));
});

redisClient.on("reconnecting", (data) => {
	logger.warning("redis-reconnecting", data);
});

redisClient.on("ready", () => {
	logger.notice("Redis client connected to", redisClient.address, "db", redisClient.selected_db);
});

module.exports = redisClient;
