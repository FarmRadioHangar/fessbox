var fs = require("fs");
var redis = require("redis"),
	redisClient = redis.createClient();
var astConf = require("./config/asterisk.json");
var stateFile = __dirname + "/state/snapshot.json";

var myLib = require("./myLib");

redisClient.on("error",  function(err) {
	myLib.consoleLog('error', err);
});

var loadDefaults = function() {
	exports.ui = {
		mixer: {
			channels: {},
			master: null,
			host: null,
//			hosts: astConf.hosts,
//			operators: astConf.operators
		},
		users: {}
	};

	exports.ui.mixer.master = require("./state/master.json");
	exports.ui.mixer.host = require("./state/host.json");

	exports.asterisk = {
	//	hosts: {},
		channels: {},
		conference: {
//			input: null,
//			output: null,
	//		members: {},
			on_air: null
		},
		master: {
		}
	};

	for (var dongleName in astConf.dongles) {
		loadChannel(dongleName);
		exports.ui.mixer.channels[dongleName].label = astConf.dongles[dongleName].number;
		exports.ui.mixer.channels[dongleName].type = 'dongle';
	}

	for (var i in astConf.operators) {
		//loadChannel(astConf.operators[i]);
		//exports.ui.mixer.channels[astConf.hosts[i]].type = 'sip';
		loadUser(astConf.operators[i]);
	}

};

function saveSnapshot(exit) {
	var myData = {
		mixer: exports.ui.mixer,
		users: exports.ui.users,
		asterisk: exports.asterisk
	};
	fs.writeFile(stateFile, JSON.stringify(myData), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveSnapshot - " + JSON.stringify(err));
		} else {
			console.log("NOTICE::saveSnapshot - data saved to disk");
		}
		if (exit) {
			exit();
		}
	});
}

function loadSnapshot() {
	if (fs.existsSync(stateFile)) {
		var myData = require(stateFile);
		exports.ui = {
			mixer: myData.mixer,
			users: myData.users
		};
		exports.asterisk = myData.asterisk;
		console.log("NOTICE::loadSnapshot - data loaded from disk");
	} else {
		console.log("NOTICE::loadSnapshot - " + stateFile + " not found, starting with empty state");
		loadDefaults();
	}
}

function loadUser(user_id) {
	var userFile = __dirname + "/state/users/" + user_id + ".json";
	if (fs.existsSync(userFile)) {
		var myData = require(userFile);
		exports.ui.users[user_id] = myData;
		myLib.consoleLog('debug', "loadUser - data loaded from disk", user_id);
		return true;
	} else {
		myLib.consoleLog('error', "loadUser - not found", userFile);
		return false;
	}
}

function saveUser(user_id) {
	var userFile = __dirname + "/state/users/" + user_id + ".json";
	fs.writeFile(userFile, JSON.stringify(exports.ui.users[user_id]), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveUser - " + JSON.stringify(err));
		} else {
			console.log("NOTICE::saveUser - data saved to disk", JSON.stringify(exports.ui.users[user_id]));
		}
	});
}

function loadChannel(channel_id) {
	var channelFile = __dirname + "/state/channels/" + channel_id + ".json";
	if (fs.existsSync(channelFile)) {
		var myData = require(channelFile);
		exports.ui.mixer.channels[channel_id] = myData;
		exports.ui.mixer.channels[channel_id].mode = 'defunct';
		exports.ui.mixer.channels[channel_id].timestamp = null;
		//exports.ui.mixer.channels[channel_id].direction = astConf.operators.indexOf(channel_id) !== -1 ? 'operator' : null;
		exports.asterisk.channels[channel_id] = {};
		myLib.consoleLog('debug', "loadChannel - data loaded from disk", channel_id);
		return true;
	} else {
		myLib.consoleLog('error', "loadChannel - not found", channelFile);
		return false;
	}
}

function saveChannel(channel_id) {
	channelFile = __dirname + "/state/channels/" + channel_id + ".json";
	fs.writeFile(channelFile, JSON.stringify(exports.ui.mixer.channels[channel_id]), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveChannel - " + JSON.stringify(err));
		} else {
			console.log("NOTICE::saveChannel - data saved to disk", JSON.stringify(exports.ui.mixer.channels[channel_id]));
		}
	});
}

function messageTagAdd(message_ids, tag, cb) {
	redisClient.sadd(tag, message_ids, cb);
}

function messageTagRemove(message_ids, tag, cb) {
	redisClient.srem(tag, message_ids, cb);
}

function messageSave(message_id, message) {
	/*
	console.log("messageSave");
	redisClient.keys('*', redis.print);
	redisClient.flushdb();
	redisClient.keys('*', redis.print);
	redisClient.hmset(message_id, message, redis.print);
	redisClient.zadd("inbox", Date.now(), message_id, redis.print);
	*/
	redisClient.multi().
		hmset(message_id, message).
		zadd("inbox", Date.now(), message_id).
		exec(function (err) {
			if (err) {
				myLib.consoleLog('error', messageSave, err);
			}
		});
}

function messageDelete(message_ids, cb) {
	redisClient.multi().
		zrem("inbox", message_ids).
		del(message_ids).
		exec(cb);
}

function messageFetch(count, reference_id, cb) {
	var fetchMessageIds = function (err, message_ids) {
		if (!err) {
			var messagesMulti = redisClient.multi();
			//todo: add watch(reference_id);
			for(var index in message_ids) {
				messagesMulti.hgetall(message_ids[index]);
			}
			messagesMulti.exec(function (err, message_objects) {
				if (!err) {
					var messages = {};
					for(index in message_ids) {
						messages[message_ids[index]] = message_objects[index];
					}
					cb(null, {
						reference_id: reference_id,
						ids: message_ids,
						messages: messages
					});
				} else {
					cb(err);
				}
			});
		} else {
			cb(err);
		}
	};

	if (!reference_id) {
		redisClient.zrevrange("inbox", 0, count, fetchMessageIds);
	} else {
		redisClient.zrevrank("inbox", reference_id, function (err, reference_index) {
			redisClient.zrevrange("inbox", reference_index + 1, count, fetchMessageIds);
		});
	}
}

function contactUpdate(contact_key, data, cb) {
	var contactArray = [];
	for(var key in data) {
		contactArray.push(key);
		contactArray.push(data);
	}
	redisClient.hmset(contact_key, contactArray, cb);
}

function contactDelete(contact_key, cb) {
	redisClient.del(contact_key, cb);
}

function contactFetch(contact_key, cb) {
	redisCient.hgetall(contact_key, cb);
}

exports.saveSnapshot = saveSnapshot;
exports.saveUser = saveUser;
exports.saveChannel = saveChannel;
exports.loadSnapshot = loadSnapshot;
exports.loadUser = loadUser;
exports.loadChannel = loadChannel;
exports.loadSnapshot = loadSnapshot;
exports.messages = {
	save: messageSave,
	delete: messageDelete,
	fetch: messageFetch
};
exports.contacts = {
	update: contactUpdate,
	delete: contactDelete,
	fetch: contactFetch
};
/*
exports.recordings = {
	save: recordingSave,
	delete: recordingDelete,
	fetch: recordingFetch
};
*/
