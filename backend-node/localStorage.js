var fs = require("fs");
var astConf = require("./config/asterisk.json");
var stateFile = __dirname + "/state/snapshot.json";

exports.ui = {
	mixer: {
		channels: {},
		master: null,
		hosts: astConf.hosts,
		operators: astConf.operators
	},
	users: {}
};

exports.ui.mixer.master = require("./state/master.json");

exports.asterisk = {
	hosts: {},
	channels: {},
	conference: {
		input: null,
		output: null,
//			members: {},
		on_air: null
	},
	master: {
	}
};

for (var dongleName in astConf.dongles) {
	loadChannel(dongleName);
	exports.ui.mixer.channels[dongleName].number = astConf.dongles[dongleName].number;
	exports.ui.mixer.channels[dongleName].mode = 'defunct';
	exports.ui.mixer.channels[dongleName].type = 'dongle';
	exports.asterisk.channels[dongleName] = {};
}

for (var i in astConf.hosts) {
	loadChannel(astConf.hosts[i]);
	exports.ui.mixer.channels[astConf.hosts[i]].mode = 'defunct';
	exports.ui.mixer.channels[astConf.hosts[i]].type = 'sip';
	exports.asterisk.channels[astConf.hosts[i]] = {};
	loadUser(astConf.hosts[i]);
}

function saveSnapshot(exit) {
	//todo
//      if (exit) {
	var myData = {
		mixer: exports.ui.mixer
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
//      }
}

function loadSnapshot() {
	fs.exists(stateFile, function (exists) {
		if (exists) {
			var myData = require(stateFile);
			exports.ui.mixer = myData.mixer;
			console.log("NOTICE::loadSnapshot - data loaded from disk");
		} else {
			console.log("NOTICE::loadSnapshot - " + stateFile + " not found, starting with empty state");
		}
	});
}

function saveUser(user_id) {
	var userFile = __dirname + "/state/users/" + user_id + ".json";
	fs.writeFile(userFile, JSON.stringify(exports.ui.users[user_id]), "utf8", function (err) {
		if (err) {
				console.error("ERROR::saveUser - " + JSON.stringify(err));
		} else {
				console.log("NOTICE::saveUser - data saved to disk");
		}
	});
}

function loadChannel(channel_id) {
	var channelFile = __dirname + "/state/channels/" + channel_id + ".json";
	if (fs.existsSync(channelFile)) {
		var myData = require(channelFile);
		exports.ui.mixer.channels[channel_id] = myData;
		console.log("NOTICE::loadChannel - data loaded from disk", channel_id);
	} else {
		console.log("NOTICE::loadChannel - " + channelFile + " not found");
	}
}

function loadUser(user_id) {
	var userFile = __dirname + "/state/users/" + user_id + ".json";
	if (fs.existsSync(userFile)) {
		var myData = require(userFile);
		exports.ui.users[user_id] = myData;

		console.log("NOTICE::loadUser - data loaded from disk", user_id);
	} else {
		console.log("NOTICE::loadUser - " + userFile + " not found");
	}
}

function saveChannel(channel_id) {
	channelFile = __dirname + "/state/channels/" + channel_id + ".json";
	fs.writeFile(channelFile, JSON.stringify(exports.ui.mixer.channels[channel_id]), "utf8", function (err) {
		if (err) {
			console.error("ERROR::saveChannel - " + JSON.stringify(err));
		} else {
			console.log("NOTICE::saveChannel - data saved to disk");
		}
	});
}


exports.saveSnapshot = saveSnapshot;
exports.saveUser = saveUser;
exports.saveChannel = saveChannel;
exports.loadSnapshot = loadSnapshot;
exports.loadUser = loadUser;
exports.loadChannel = loadChannel;
exports.loadSnapshot = loadSnapshot;
