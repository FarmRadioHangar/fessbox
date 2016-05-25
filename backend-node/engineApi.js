/*

this is the API to be used by the underlying voice/messaging system

public functions throw exceptions when called in a wrong way.

*/

var uuid = require("node-uuid");

var appConfig = require("./config/app.json");
var addressBook = require("./" + appConfig.addressBook);

var wss = require("./websocket");
var myLib = require("./myLib");
var mixerLib = require("./mixerLib");
var s = require("./localStorage");

function changeMode(channel_id, value) {
	var modify = {};
	if (s.ui.mixer.channels[channel_id].mode === 'ring') {
		modify.timestamp = Date.now();
	}
	if (value === 'free' || value === 'defunct') {
		modify.timestamp = null;
		if (s.ui.mixer.channels[channel_id].direction !== 'operator') {
			modify.direction = null;
		}
		modify.contact = null;
		if (s.ui.mixer.channels[channel_id].contact && s.ui.mixer.channels[channel_id].contact.modified) {
			pbxProvider.setPhoneBookEntry(s.ui.mixer.channels[channel_id].contact.number, s.ui.mixer.channels[channel_id].contact.name);
			//addressBook.setContactInfo(s.ui.mixer.channels[channel_id].contact);
		}
	}
	modify.mode = value;
	mixerLib.channelUpdateProperties(channel_id, modify);
}

//
//voice
//
exports.channelUpdate = function (channel_id, channel) {
	if (!myLib.checkObjectProperties(channel)) {
		myLib.consoleLog('panic', 'engineApi::channelUpdate', "invalid input", channel);
	} else if (mixerLib.channelCreate(channel_id, channel) || mixerLib.channelMode(channel_id, channel)) {
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


