/*

this is the API to be used by the underlying voice/messaging system

public functions throw exceptions when called in a wrong way.

*/

var uuid = require("uuid");

//var appConfig = require("./etc/app.json");
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
//	} else {
//		myLib.consoleLog('debug', 'engineApi::channelUpdate', "nothing to do for " + channel_id, channel);
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
		var key = uuid.v1();
		s.messages.save('inbox.' + key, data);
		var newMessage = {};
		data.id = key;
		newMessage[key] = data;
		//wss.broadcastEvent("inboxUpdate", newMessage);
		wss.broadcastEvent("message:update", newMessage);
		var msgType = data.type.split('_');
		myLib.jsonLog({
			endpoint: data.endpoint,
			channel_id: data.channel_id,
			type: msgType[0],
			direction: msgType[1]
		}, ["telegraf"], ["inbox"], { message: { value: 1 }}, data.content);
	}
};

exports.callUpdate = function(data) {
	let required = ["number", "name", "timestamp", "filename"];
	if (!myLib.checkObjectProperties(data, required)) {
		myLib.consoleLog('panic', 'engineApi::callUpdate', "invalid input", data);
	} else {
		data.id = uuid.v1();
		s.calls.save(data.id, data);
		wss.broadcastEvent("calls:update", { [data.id]: data });

		/*let call = Object.assign({}, data);
		call.id = uuid.v1();
		s.calls.save(call.id, call);
		let newCall = {};
		newCall[call.id] = call;
		wss.broadcastEvent("calls:update", newCall);*/
	}
};
