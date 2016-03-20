
var myLib = require("./myLib");
var api = require("./api");
var ami = require("./ami");
var s = require("./localStorage");

/*
exports.connectNumbers = function (response, params) {
	var result = ami.connectNumbers(params.number1, params.number2);
	myLib.httpGeneric(200, result, response, "DEBUG::connectNumbers");
};
*/

exports.channelProperty = function (response, params) {
	api.setChannelProperty(params.channel_id, params.name, params.value, function (err) {
		if (err) {
			myLib.consoleLog('debug', 'setChannelProperty', err);
		}
	});
	myLib.httpGeneric(200, '', response, "DEBUG::setChannelProperty");
};

exports.getCurrentState = function (response, params) {
	api.getCurrentState(params.user_id, function (err, currentState) {
		if (err) {
			myLib.httpGeneric(513, err, response, "DEBUG::getCurrentState");
		} else {
			myLib.httpGeneric(200, JSON.stringify(currentState), response, "DEBUG::getCurrentState");
		}
	});
};

exports.messageSend = function (response, params) {
	api.messageSend(params, function (err) {
		if (err) {
			myLib.httpGeneric(513, err, response, "DEBUG::messageSend");
		} else {
			myLib.httpGeneric(200, "ok", response, "DEBUG::messageSend");
		}
	});
};
