var logger = new (require("./logger"))(__filename);
var fs = require("fs");
var redisClient = require("./redisClient");
var astConf = require("./etc/asterisk.json");
var stateFile = __dirname + "/state/snapshot.json";
var engineApi = require("./engineApi");
var myLib = require("./myLib");

var MONITOR_PATH = process.env.MONITOR_PATH || "/var/spool/asterisk/monitor/test";

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

redisClient.on('ready', function() {
	//myLib.consoleLog('info', "redis", "connection established");
	redisClient.get("master", function(err, res) {
		if (res) {
			exports.ui.mixer.master = JSON.parse(res);
		} else {
			exports.ui.mixer.master = require("./etc/defaults/master.json");
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
	//handle gracefully partialy received multipart sms messages
	exports.asterisk.sms_in.forEach((value) => {
		clearTimeout(value.timeout);
		engineApi.inboxUpdate(value.data);
	});
	exports.asterisk.sms_in = null;

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
		var usersPath = __dirname + "/etc/defaults/users/";
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
	var userFile = __dirname + "/etc/defaults/operators/" + channel_id + ".json";
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
		var channelsPath = __dirname + "/etc/defaults/channels/";
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
		if (!res) {
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

function messageFavoriteSet(message_ids, cb) {
	redisClient.sadd("msgTags:favorite", message_ids);
	var redisMulti = redisClient.multi();
	message_ids.forEach(function(message_id) {
		redisMulti.hset('inbox.' + message_id, "favorite", 1);
	});
	redisMulti.exec(function(err, res) {
		if (!err) {
			var messageList = {};
			var updated = [];
			var messagesMulti = redisClient.multi();
			for(var index in message_ids) {
				if (res[index]) {
					messagesMulti.hgetall('inbox.' + message_ids[index]);
					updated.push(message_ids[index]);
				}
			}
			messagesMulti.exec(function (err, message_objects) {
				for(index in updated) {
					message_objects[index].id = updated[index]; //temp
					messageList[(message_objects[index].type === 'sms_in' ? 'inbox.' : 'outbox.') +  updated[index]] = message_objects[index];
					//messageList[updated[index]] = message_objects[index];
				}
				cb(null, messageList);
			});
		} else {
			cb(err);
		}
	});
}

function messageTagAdd(message_ids, tags, cb) {
	var redisMulti = redisClient.multi();
	tags.forEach(function(tag){
		redisMulti().sadd("msgTags:" + tag, message_ids);
	});
	redisMulti.exec(cb);
}

function messageFavoriteUnset(message_ids, cb) {
	redisClient.srem("msgTags:favorite", message_ids);
	let redisMulti = redisClient.multi();
	for(let index in message_ids) {
		redisMulti.hdel('inbox.' + message_ids[index], "favorite");
	}
	redisMulti.exec(function(err, res) {
		if (!err) {
			let messageList = {};
			let updated = [];
			let messagesMulti = redisClient.multi();
			for(let index in message_ids) {
				if (res[index]) {
					messagesMulti.hgetall('inbox.' + message_ids[index]);
					updated.push(message_ids[index]);
				}
			}
			messagesMulti.exec(function (err, message_objects) {
				for(let index in updated) {
					message_objects[index].id = updated[index]; //temp
					messageList[(message_objects[index].type === 'sms_in' ? 'inbox.' : 'outbox.') +  updated[index]] = message_objects[index];
				}
				cb(null, messageList);
			});
		} else {
			cb(err);
		}
	});
}

function messageTagRemove(message_ids, tags, cb) {
	var redisMulti = redisClient.multi();
	tags.forEach(function(tag){
		redisMulti().srem("msgTags:" + tag, message_ids);
	});
	redisMulti.exec(cb);
	//redisClient.srem("msgTags:" + tag, message_ids, cb);
}

function messagesUpdate(message_ids, properties, cb) {
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
	message_ids = message_ids.map((message_id) => ('inbox.' + message_id)); //temp
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
					//var messages = {};
					for(index in message_ids) {
						//messages[message_ids[index]] = message_objects[index];
						message_objects[index].id = message_ids[index].split('.')[1]; //temp
					}
					cb(null, {
						reference_id: reference_id,
						//ids: message_ids,
						//messages: messages,
						messages: message_objects,
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

function messageList (filter, cb) {
	var fetchMessageIds = function (err, message_ids) {
		if (!err) {
			logger.debug('messageList:fetchMessageIds', message_ids);
			var messagesMulti = redisClient.multi();
			//todo: add watch(reference_id);
			for(var index in message_ids) {
				messagesMulti.hgetall(message_ids[index]);
				//messagesMulti.smembers();
			}
			messagesMulti.exec(function (err, message_objects) {
				if (!err) {
					//var messages = {};
					for(index in message_ids) {
						//messages[message_ids[index]] = message_objects[index];
						message_objects[index].id = message_ids[index].split('.')[1]; //temp
					}
					cb(null, {
						//reference_id: reference_id,
						//ids: message_ids,
						//messages: messages,
						messages: message_objects,
					});
				} else {
					cb(err);
				}
			});
		} else {
			cb(err);
		}
	};

	let max = filter.to ? +filter.to : Date.now();
	let min = filter.from ? +filter.from : 0;
	let rangeMsgIds = !filter.tags ? fetchMessageIds : (err, message_ids) => {
		redisClient.sinter(...filter.tags.map(tag => ('msgTags:' + tag)), (err, tagged_ids) => {
			if (err) cb(err);
			else fetchMessageIds(null, [message_ids, tagged_ids].reduce((a, b) => a.filter(c => b.includes(c))));
		});
	};
	redisClient.zrevrangebyscore("inbox", max, min, rangeMsgIds);
}

/**
 * Call History
 */

function callFavoriteSet(call_ids, cb) {
	redisClient.sadd("callTags:favorite", call_ids);
	var redisMulti = redisClient.multi();
	call_ids.forEach(function(call_id) {
        redisMulti.hset(['call', call_id].join(':'), "favorite", 1);
	});
	redisMulti.exec(function(err, res) {
		if (!err) {
			var callList = {};
			var updated = [];
			var callsMulti = redisClient.multi();
			for(var index in call_ids) {
				if (res[index]) {
					callsMulti.hgetall(['call', call_ids[index]].join(':'));
					updated.push(call_ids[index]);
				}
			}
			callsMulti.exec(function (err, call_objects) {
				for(index in updated) {
					let id = updated[index];
					callList[id] = call_objects[index];
				}
				cb(null, callList);
			});
		} else {
			cb(err);
		}
	});
}

function callFavoriteUnset(call_ids, cb) {
	redisClient.srem("callTags:favorite", call_ids);
	let redisMulti = redisClient.multi();
	for(let index in call_ids) {
		redisMulti.hdel(['call', call_ids[index]].join(':'), "favorite");
	}
	redisMulti.exec(function(err, res) {
		if (!err) {
			let callList = {};
			let updated = [];
			let callsMulti = redisClient.multi();
			for(let index in call_ids) {
				if (res[index]) {
					callsMulti.hgetall(['call', call_ids[index]].join(':'));
					updated.push(call_ids[index]);
				}
			}
			callsMulti.exec(function (err, call_objects) {
				for(let index in updated) {
					let id = updated[index];	
					callList[id] = call_objects[index];
				}
				cb(null, callList);
			});
		} else {
			cb(err);
		}
	});
}

function callTagAdd(call_ids, tags, cb) {
	var redisMulti = redisClient.multi();
	tags.forEach(function(tag){
		redisMulti().sadd("callTags:" + tag, call_ids);
	});
	redisMulti.exec(cb);
}

function callTagRemove(call_ids, tags, cb) {
	var redisMulti = redisClient.multi();
	tags.forEach(function(tag){
		redisMulti().srem("callTags:" + tag, call_ids);
	});
	redisMulti.exec(cb);
}

function callSave(call_id, call) {
	redisClient.multi().
		hmset(['call', call_id].join(':'), call).
		zadd("call", Date.now(), call_id).
		exec(function (err) {
			if (err) {
				myLib.consoleLog('error', callSave, err);
			}
		});
}

function callDelete(call_ids, cb) {
	let redisMulti = redisClient.multi();
	let ids = call_ids.map(id => {
		id = ['call', id].join(':');
		redisMulti.hgetall(id);
		return id;
	});

	redisMulti.exec((error, calls) => {
		let remove = [];
		let count = 0;
		calls = calls.map(call => ({ filename: call.filename, id: call.id })).forEach((call, index, calls) => {
			let path = [MONITOR_PATH, call.filename].join('/');
			fs.unlink(path, (error) => {
				if (error && error.code === 'ENOENT' || !error) {
					logger.debug('File "' + path + '" not found!', error);
					remove.push(call.id);
					if (count=== calls.length - 1) {
						logger.debug('we got final remove list.', remove);
						redisClient.
						multi().
						zrem("call", remove).
						del(remove.map(call => (['call', call.id].join(':')))).
						exec((error) => {
							if (error) {
								logger.error(error);
							}
							logger.debug(remove.length + ' calls removed!', remove);
							cb(error, remove);
						});
					}
				} else {
					logger.error('Failed to remove file!', error);
				}
				count++;
			});
		});

	//	let files = calls.filter(call => {
		//	if(call.filename && call.filename.length) return true;
		//	idsWithoutFiles.push(['call', call.id].join(':'));
		//	return false;
		//}).map(call => (call.filename));
		//let count = 0;
		//files.forEach(file => {
		//	let path = [MONITOR_PATH, file].join('/');
		//	fs.unlink(path + 'test', (error) => {
		//		if (error) {
		//			my
		//		}
		//	});
		//});
	});

	//redisClient.multi().
	//	zrem("call", call_ids).
	//	del(call_ids).
	//	exec(cb);
}

function callList (filter, cb) {
	var fetchCallIds = function (err, call_ids) {
		if (!err) {
			logger.debug('callList:fetchCallIds', call_ids);
			var callsMulti = redisClient.multi();
			//todo: add watch(reference_id);
			for(var index in call_ids) {
				callsMulti.hgetall(['call', call_ids[index]].join(':'));
			}
			callsMulti.exec(function (err, call_objects) {
				if (!err) {
					cb(null, {
						calls: call_objects,
					});
				} else {
					cb(err);
				}
			});
		} else {
			cb(err);
		}
	};

	let max = filter.to ? +filter.to : Date.now();
	let min = filter.from ? +filter.from : 0;
	let rangeCallIds = !filter.tags ? fetchCallIds : (err, call_ids) => {
		redisClient.sinter(...filter.tags.map(tag => ('callTags:' + tag)), (err, tagged_ids) => {
			if (err) cb(err);
			else fetchCallIds(null, [call_ids, tagged_ids].reduce((a, b) => a.filter(c => b.includes(c))));
		});
	};
	redisClient.zrevrangebyscore("call", max, min, rangeCallIds);
}

/**
 * Call History END
 */

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
	favoriteSet: messageFavoriteSet,
	favoriteUnset: messageFavoriteUnset,
	save: messageSave,
	delete: messageDelete,
	list: messageList,
	fetch: messageFetch
};
exports.calls = {
	tag: callTagAdd,
	untag: callTagRemove,
	favoriteSet: callFavoriteSet,
	favoriteUnset: callFavoriteUnset,
	save: callSave,
	delete: callDelete,
	list: callList
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
