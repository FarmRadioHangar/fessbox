/*

this is the API to be used by the underlying voice/messaging system

public functions throw exceptions when called in a wrong way.

*/

var uuid = require("node-uuid");

//var appConfig = require("./config/app.json");
//var addressBook = require("./" + appConfig.addressBook);

var wss = require("./websocket");
var myLib = require("./myLib");
var mixerLib = require("./mixerLib");
var s = require("./localStorage");


//
//voice
//
exports.channelUpdate = function (channel_id, channel) {
	if (!myLib.checkObjectProperties(channel)) {
		myLib.consoleLog('panic', 'engineApi::channelUpdate', "invalid input", channel);
	} else if (mixerLib.channelCreate(channel_id, channel) || mixerLib.channelMode(channel_id, channel) || mixerLib.channelUpdateProperties(channel_id, channel)) {
		mixerLib.channelUpdateEvent([channel_id]);
	} else {
		myLib.consoleLog('debug', 'engineApi::channelUpdate', "nothing to do", channel);
	}
};
//
// messagging
//
exports.inboxUpdate = function (data) {
	var required = ["type", "timestamp", "endpoint", "content"];
	if (!myLib.checkObjectProperties(data, required)) {
		myLib.consoleLog('panic', 'engineApi::inboxUpdate', "invalid input", data);
	} else {
		var key = "inbox." + uuid.v1();
		s.messages.save(key, data);
		var newMessage = {};
		newMessage[key] = data;
		wss.broadcastEvent("inboxUpdate", newMessage);
	}
};


