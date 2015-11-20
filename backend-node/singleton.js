var fs = require("fs");
var stateFile = __dirname + "/state/snapshot.json";
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

function saveHost(host_id) {
	var hostFile = __dirname + "/state/hosts/" + host_id + ".json";
	fs.writeFile(hostFile, JSON.stringify(exports.ui.mixer.hosts[host_id]), "utf8", function (err) {
		if (err) {
				console.error("ERROR::saveHost - " + JSON.stringify(err));
		} else {
				console.log("NOTICE::saveHost - data saved to disk");
		}
	});
}

function loadChannel(channel_id) {
	var channelFile = __dirname + "/state/channels/" + channel_id + ".json";
	if (fs.existsSync(channelFile)) {
		var myData = require(channelFile);
		exports.ui.mixer.channels[channel_id] = myData;
		console.log("NOTICE::loadSnapshot - data loaded from disk");
	} else {
		console.log("NOTICE::loadSnapshot - " + channelFile + " not found");
	}
}

function loadHost(host_id) {
	var hostFile = __dirname + "/state/hosts/" + host_id + ".json";
	fs.exists(hostFile, function (exists) {
		if (exists) {
			var myData = require(hostFile);
			exports.ui.mixer.hosts[host_id] = myData;
			console.log("NOTICE::loadSnapshot - data loaded from disk");
		} else {
			console.log("NOTICE::loadSnapshot - " + hostFile + " not found");
		}
	});
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
exports.saveHost = saveHost;
exports.saveChannel = saveChannel;
exports.loadSnapshot = loadSnapshot;
exports.loadHost = loadHost;
exports.loadChannel = loadChannel;
exports.loadSnapshot = loadSnapshot;
exports.ui = {};
