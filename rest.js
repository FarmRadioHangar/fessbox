
var myLib = require("./myLib");
var userApi = require("./userApi");
var ami = require("./ami");
var s = require("./localStorage");

/*
exports.connectNumbers = function (response, params) {
	var result = ami.connectNumbers(params.number1, params.number2);
	myLib.httpGeneric(200, result, response, "DEBUG::connectNumbers");
};
*/
exports.restartAsterisk = function (response, params) {
};

exports.resetModems = function (response, params) {
	if (params.name) {
		if (s.ui.mixer.channels[params.name] && s.ui.mixer.channels[params.name].mode !== 'defunct') {
			myLib.httpGeneric(200, '', response, "DEBUG::resetModems " + params.name);
			ami.command("dongle reset " + params.name);
		} else {
			myLib.httpGeneric(422, '', response, "DEBUG::resetModems " + params.name);
		}
	} else {
		myLib.httpGeneric(200, '', response, "DEBUG::resetModems");
		Object.keys(s.ui.mixer.channels).forEach((channel_id) => {
			let channel = s.ui.mixer.channels[channel_id];
			if (channel.type === 'dongle' && channel.mode !== 'defunct') {
				ami.command("dongle reset " + channel_id);
			}
		});
	}
};

exports.dongleCommand = function (response, params) {
	if (params.cmd && s.ui.mixer.channels[params.name] && s.ui.mixer.channels[params.name].mode !== 'defunct') {
		let command = ["dongle cmd", params.name, params.cmd].join(' ');
		myLib.httpGeneric(200, command, response, "DEBUG::dongleCommand " + params.name);
		ami.command(command);
	} else {
		myLib.httpGeneric(422, '', response, "DEBUG::dongleCommand " + params.name);
	}
};

exports.channelProperty = function (response, params) {
	userApi.setChannelProperty(params.channel_id, params.name, params.value, function (err) {
		if (err) {
			myLib.consoleLog('debug', 'setChannelProperty', err);
		}
	});
	myLib.httpGeneric(200, '', response, "DEBUG::setChannelProperty");
};

exports.getCurrentState = function (response, params) {
	userApi.getCurrentState(params.user_id, function (err, currentState) {
		if (err) {
			myLib.httpGeneric(513, err, response, "DEBUG::getCurrentState");
		} else {
			myLib.httpGeneric(200, JSON.stringify(currentState), response, "DEBUG::getCurrentState");
		}
	});
};

exports.messageSend = function (response, params) {
	userApi.messageSend(params, function (err) {
		if (err) {
			myLib.httpGeneric(513, err, response, "DEBUG::messageSend");
		} else {
			myLib.httpGeneric(200, "ok", response, "DEBUG::messageSend");
		}
	});
};

exports.callNumber = function (response, params) {
	userApi.callNumber(params.number, params.mode, params.channel_id, function (err) {
		if (err) {
			myLib.consoleLog('debug', 'callNumber', err);
		}
	});
	myLib.httpGeneric(200, "ok", response, "DEBUG::callNumber");
};

exports.getObjects = function (response, params) {
	var path = params.name.split('.');
	var objects = s[path[0]];
	for(var i = 1; i < path.length; i++) {
		 objects = objects[path[i]];
	}
	myLib.httpGeneric(200,  JSON.stringify(objects, null, 4), response, "DEBUG::getObjects");
};
