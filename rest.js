var myLib = require("./myLib");
var userApi = require("./userApi");
var ami = require("./ami");
var s = require("./localStorage");

/*
exports.connectNumbers = function (params, reply) {
	var result = ami.connectNumbers(params.number1, params.number2);
	reply(200, result);
};
exports.restartAsterisk = function (params, reply) {
};
*/

exports.systemRestart = function (params, reply) {
	myLib.sysExec("/usr/bin/sudo", ["/usr/bin/shutdown", "-r", "now"], (err, output) => {
		reply(err ? 503 : 200, output);
	});
	if (params.reason) {
		myLib.jsonLog({
			reason: reason,
		}, ["telegraf", "notice"], ["bulletproof"], { systemRestartRequests: {
			value: 1
		}});
	}
};

exports.resetModems = function (params, reply) {
	var resetDongle = function (dongleName, reason) {
		ami.command("dongle reset " + dongleName);
		if (reason) {
			myLib.jsonLog({
				name: dongleName,
				reason: reason,
			}, ["telegraf", "notice"], ["bulletproof"], { modemResetRequests: {
				value: 1
			}});
		}
	};

	if (params.name) {
		if (s.ui.mixer.channels[params.name] && s.ui.mixer.channels[params.name].mode !== 'defunct') {
			reply(200, '');
			resetDongle(params.name, params.reason);
		} else {
			reply(422, '');
		}
	} else {
		reply(200, '');
		Object.keys(s.ui.mixer.channels).forEach((channel_id) => {
			let channel = s.ui.mixer.channels[channel_id];
			if (channel.type === 'dongle' && channel.mode !== 'defunct') {
				resetDongle(channel_id, params.reason);
			}
		});
	}
};

exports.dongleCommand = function (params, reply) {
	if (params.cmd && s.ui.mixer.channels[params.name] && s.ui.mixer.channels[params.name].mode !== 'defunct') {
		let command = ["dongle cmd", params.name, params.cmd].join(' ');
		reply(200, command);
		ami.command(command);
	} else {
		reply(422, '');
	}
};

exports.channelProperty = function (params, reply) {
	userApi.setChannelProperty(params.channel_id, params.name, params.value, function (err) {
		if (err) {
			myLib.consoleLog('debug', 'setChannelProperty', err);
		}
	});
	reply(200, '');
};

exports.getCurrentState = function (params, reply) {
	userApi.getCurrentState(params.user_id, function (err, currentState) {
		if (err) {
			reply(513, err);
		} else {
			reply(200, JSON.stringify(currentState));
		}
	});
};

exports.messageSend = function (params, reply) {
	userApi.messageSend(params, function (err) {
		if (err) {
			reply(513, err);
		} else {
			reply(200, "ok");
		}
	});
};

exports.callNumber = function (params, reply) {
	userApi.callNumber(params.number, params.mode, params.channel_id, function (err) {
		if (err) {
			myLib.consoleLog('debug', 'callNumber', err);
		}
	});
	reply(200, "ok");
};

exports.getObjects = function (params, reply) {
	var path = params.name.split('.');
	var objects = s[path[0]];
	for(var i = 1; i < path.length; i++) {
		 objects = objects[path[i]];
	}
	reply(200,  JSON.stringify(objects, null, 4));
};
