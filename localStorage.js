var fs = require("fs");
var redisClient = require("./redisClient");
var astConf = require("./config/asterisk.json");
var stateFile = __dirname + "/state/snapshot.json";

var myLib = require("./myLib");

redisClient.on("error",  function(err) {
	myLib.consoleLog('error', "redis", err);
});

	exports.ui = {
		mixer: {
			channels: {},
			master: {},
			host: null,
//			hosts: astConf.hosts,
//			operators: astConf.operators
		},
		operators: {}
	};

redisClient.on('connect', function() {
	myLib.consoleLog('info', "redis", "connection established");
	redisClient.get("master", function(err, res) {
		if (res) {
			exports.ui.mixer.master = JSON.parse(res);
		} else {
			exports.ui.mixer.master = require("./config/defaults/master.json");
		}
		exports.ui.mixer.host = exports.ui.mixer.master.in; // temp
	});
});

/*
var saveDefaults = function() {
};

var loadDefaults = function() {
	exports.ui = {
		mixer: {
			channels: {},
			master: {},
			host: null,
//			hosts: astConf.hosts,
//			operators: astConf.operators
		},
		operators: {}
	};

	exports.ui.mixer.master = require("./state/master.json");
	exports.ui.mixer.master.out = require("./state/master_out.json");
	exports.ui.mixer.master.in = require("./state/host.json");
	exports.ui.mixer.host = exports.ui.mixer.master.in;
	
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
		loadOperator(astConf.operators[i]);
	}

};
*/

function saveSnapshot(exit) {
	var myData = {
		mixer: exports.ui.mixer,
		operators: exports.ui.operators,
		asterisk: exports.asterisk
	};
	fs.writeFile(stateFile, JSON.stringify(myData), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveSnapshot - " + JSON.stringify(err));
		} else {
			console.error("NOTICE::saveSnapshot - data saved to disk");
		}
		if (exit) {
			exit();
		}
	});
}
/*
function loadSnapshot() {
	if (fs.existsSync(stateFile)) {
		var myData = require(stateFile);
		exports.ui = {
			mixer: myData.mixer,
			operators: myData.operators
		};
		exports.asterisk = myData.asterisk;
		console.error("NOTICE::loadSnapshot - data loaded from disk");
	} else {
		console.error("NOTICE::loadSnapshot - " + stateFile + " not found, starting with empty state");
		loadDefaults();
	}
}
*/

function loadOperator(channel_id, cb) {
	var loadFromFile = function () {
		var usersPath = __dirname + "/config/defaults/users/";
		var userFile = usersPath + channel_id + ".json";
		var myData;
		if (!fs.existsSync(userFile)) {
			myData = require(usersPath + "default.json");
		} else {
			myData = require(userFile);
		}

		exports.ui.operators[channel_id] = myData;
		if (typeof cb === 'function') {
			cb();
		} else {
			myLib.consoleLog('debug', "loadOperator - data loaded from disk", channel_id);
		}
	};

	redisClient.hgetall("operator." + channel_id, function (err, res) {
		if (!err) {
			if (typeof cb === 'function') {
				cb(null, res);
			} else {
				exports.ui.operators[channel_id] = res;
				myLib.consoleLog('debug', "loadOperator - data loaded from redis", channel_id);
			}
		} else {
			loadFromFile();
		}
	});
}

function saveOperator(channel_id, cb) {
	redisClient.hmset("operator." + channel_id, exports.ui.operators[channel_id], cb);
	/*
	var userFile = __dirname + "/config/defaults/operators/" + channel_id + ".json";
	fs.writeFile(userFile, JSON.stringify(exports.ui.operators[channel_id]), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveOperator - " + JSON.stringify(err));
		} else {
			console.error("NOTICE::saveOperator - data saved to disk", JSON.stringify(exports.ui.operators[channel_id]));
		}
	});
   */
}

function loadChannel(channel_id, cb) {
	var loadFromFile = function () {
		var channelsPath = __dirname + "/config/defaults/channels/";
		var channelFile = channelsPath + channel_id + ".json";
		var myData;
		if (!fs.existsSync(channelFile)) {
			myData = require(channelsPath + "default.json");
		} else {
			myData = require(channelFile);
		}

			exports.ui.mixer.channels[channel_id] = myData;
			exports.ui.mixer.channels[channel_id].mode = 'defunct';
			exports.ui.mixer.channels[channel_id].timestamp = null;
			//exports.ui.mixer.channels[channel_id].direction = astConf.operators.indexOf(channel_id) !== -1 ? 'operator' : null;
			exports.asterisk.channels[channel_id] = {};
			if (typeof cb === 'function') {
				cb();
			} else {
				myLib.consoleLog('debug', "loadChannel", ["data loaded from disk", channel_id]);
			}
	};

	redisClient.hgetall("channel." + channel_id, function (err, res) {
		if (!err) {
			if (typeof cb === 'function') {
				cb(null, res);
			} else {
				exports.ui.mixer.channels[channel_id] = res;
				myLib.consoleLog('debug', "loadChannel", ["data loaded from redis", channel_id]);
			}
		} else {
			loadFromFile();
		}
	});
}

function saveAudioProperties (key, data, cb) {
	var audioProperties = {
		muted: data.muted,
		level: data.level
	};
	redisClient.hmset(key, audioProperties, cb);
}

function loadProperties(key, object, cb) {
	redisClient.hgetall(key, function (err, res) {
		if (!err) {
			for(var name in res) {
				object[name] = res[name];
			}
			cb(null, object);
		} else {
			cb(err);
		}
	});
}

function saveChannel(channel_id, cb) {
	redisClient.hmset("channel." + channel_id, exports.ui.mixer.channels[channel_id], cb);
	/*
	channelFile = __dirname + "/state/channels/" + channel_id + ".json";
	fs.writeFile(channelFile, JSON.stringify(exports.ui.mixer.channels[channel_id]), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveChannel - " + JSON.stringify(err));
		} else {
			console.error("NOTICE::saveChannel - data saved to disk", JSON.stringify(exports.ui.mixer.channels[channel_id]));
		}
	});
   */
}

function messageTagAdd(message_ids, tags, cb) {
	var redisMulti = redisClient.multi();
	tags.forEach(function(tag){
		redisMulti().sadd("msgTags:" + tag, message_ids);
	});
	redisMulti.exec(cb);
}

function messageTagRemove(message_ids, tags, cb) {
	var redisMulti = redisClient.multi();
	tags.forEach(function(tag){
		redisMulti().srem("msgTags:" + tag, message_ids);
	});
	redisMulti.exec(cb);
	//redisClient.srem("msgTags:" + tag, message_ids, cb);
}

function messagesUpdate(message_ids, properties) {
	var redisMulti = redisClient.multi();
	message_ids.forEach(function(message_id){
		redisMulti().hmset("inbox." + message_id, properties);
	});
	redisMulti.exec(cb);
};

function messageSave(message_id, message) {
	/*
	console.error("messageSave");
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
				//messagesMulti.smembers();
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
exports.saveOperator = saveOperator;
exports.saveChannel = saveChannel;
//exports.loadSnapshot = loadSnapshot;
exports.loadOperator = loadOperator;
exports.loadChannel = loadChannel;
exports.messages = {
	tag: messageTagAdd,
	untag: messageTagRemove,
	save: messageSave,
	delete: messageDelete,
	fetch: messageFetch
};
exports.contacts = {
	update: contactUpdate,
	delete: contactDelete,
	fetch: contactFetch
};
exports.deleteSavedSettings = function() {

};
/*
exports.recordings = {
	save: recordingSave,
	delete: recordingDelete,
	fetch: recordingFetch
};
*/
