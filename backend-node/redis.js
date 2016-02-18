var client = require("redis").createClient();

exports.push = function(key, value) {
	client.lpush(key, value);
};

exports.set = function(key, value) {
	client.set(key, value);
};

exports.fetch = function(key, count, from_id, cb) {

	client.lrange(key, 0, count, function(err, reply) {
		    console.log(reply); // ['angularjs', 'backbone']
	});
};
