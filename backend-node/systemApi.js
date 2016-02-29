var uuid = require("node-uuid");

var appConfig = require("./config/app.json");
var addressBook = require("./" + appConfig.addressBook);

var myLib = require("./myLib");
var s = require("./localStorage");
var wss = require("./websocket");


exports.channelMode = function (channel_id, mode) {
	switch(mode) {
		case 'free':
		case 'defunct':
		case 'ring':
			break;
		default:
			myLib.consoleLog('panic', 'unknown channelMode:', mode);
	}
};

exports.inboxUpdate = function (type, timestamp, source, content) {
	var newMessage = {};
	var key = "inbox." + uuid.v1();
	newMessage[key] = {
		type: type,
		timestamp: timestamp,
		source: source,
		content: content
	};
	s.messages.save(key, newMessage[key]);
	wss.broadcastEvent("inboxUpdate", newMessage);
};


