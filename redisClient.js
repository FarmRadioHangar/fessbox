var redis = require("redis"),
	redisClient = redis.createClient();

var myLib = require("./myLib");

redisClient.on("error",  function(err) {
	myLib.consoleLog({},['error'], ["redis"], "clientError", err);
});

/*
redisClient.on('connect', function() {
	myLib.consoleLog('info', "redis", "connection established");
});
*/

module.exports = redisClient;
