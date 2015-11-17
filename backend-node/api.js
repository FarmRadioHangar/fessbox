var provider = {};
provider.asterisk = require("./ami");

var myLib = require("./myLib");
var s = require("./singleton");
var fessConfig = require("./config/fessbox.json");

s.channels = {}
s.ui.mixer = {
	channels: {},
	master: {
		level     : 50,
		on_air    : true,
		recording : false,
		delay     : 0
	},
	hosts: {}
};

function validChannel(channel_id) {
	if (!s.channels[channel_id]) {
		myLib.consoleLog('error', 'channel not found', channel_id);
		return false;
	} else {
		return true;
	}
}

exports.connectNumbers = function (response, params) {
	var result = ami.connectNumbers(params.number1, params.number2);
	myLib.httpGeneric(200, result, response, "DEBUG::connectNumbers");
};
/*
exports.setChannelVolume = function (response, params) {
	var result = ami.setChannelVolume(params.channel, params.level, params.direction);
	myLib.httpGeneric(200, result, response, "DEBUG::setChannelVolume");
};
*/

// returns null on success, error message on error
exports.setChannelVolume = function(channel_id, value) {
	var errorMsg;
	if (!s.channels[channel_id]) {
		errorMsg = 'channel not found';
		myLib.consoleLog('error', errorMsg, channel_id);
	} else {
		if (value > 100 || value < 0) {
			errorMsg = 'invalid input value';
			myLib.consoleLog('error', errorMsg, value, channel_id);
		} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'free':
				case 'ring':
				case 'defunct':
				break;
				default:
					errorMsg = provider[s.channels[channel_id].provider].setChannelVolume(channel_id, value);
			}
		}
	}
	if (!errorMsg) {
		s.ui.mixer.channels[channel_id].level = value;
	} else {
		return errorMsg;
	}
}

// returns null on success, error message on error
exports.setMasterVolume = function(value) {
	var errorMsg;
		if (value > 100 || value < 0) {
			errorMsg = 'invalid input value';
			myLib.consoleLog('error', errorMsg, value);
		} else {
			errorMsg = provider[s.channels[channel_id].provider].setMasterVolume(value);
		}
	if (!errorMsg) {
		s.ui.mixer.master.level = value;
	} else {
		return errorMsg;
	}
}

exports.setMasterMuted = function(value) {
	var errorMsg;
	if (typeof value != 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else {
		errorMsg = provider[s.channels[channel_id].provider].setMasterMuted(value);
	}
	if (!errorMsg) {
		s.ui.mixer.master.muted = value;
	} else {
		return errorMsg;
	}
}

exports.setMasterOnAir = function(value) {
	var errorMsg;
	if (typeof value != 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else {
		errorMsg = provider[s.channels[channel_id].provider].setMasterOnAir(value);
	}
	if (!errorMsg) {
		s.ui.mixer.master.on_air = value;
	} else {
		return errorMsg;
	}
}



exports.setChannelMuted = function(channel_id, value) {
	if (!s.channels[channel_id]) {
		errorMsg = 'channel not found';
		myLib.consoleLog('error', 'channel not found', channel_id);
	} else if (typeof value != 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'free':
				case 'ring':
				case 'defunct':
				break;
				default:
					errorMsg = provider[s.channels[channel_id].provider].setChannelMuted(channel_id, value);
			}
	}
	if (!errorMsg) {
		s.ui.mixer.channels[channel_id].muted = value;
	} else {
		return errorMsg;
	}
};

exports.setChannelMode = function(channel_id, value) {
//	[channel_id]: 'master' | 'ivr' | 'on_hold' | 'free' | host_id
	var errorMsg;
	if (!s.channels[channel_id]) {
		errorMsg = 'channel not found';
		myLib.consoleLog('error', 'setChannelMode', [errorMsg, channel_id]);
	} else {
		switch (value) {
			case 'master':
				if (s.ui.mixer.channels[channel_id].mode === 'master') {
					errorMsg = "channel already connected to master";
				} else {
					errorMsg = provider[s.channels[channel_id].provider].connectToMaster(channel_id);
					if (!errorMsg) {
						if (s.ui.mixer.channels[channel_id].mode === 'ring') {
							s.channels[channel_id].timestamp = new Date().now;
							s.ui.mixer.channels[channel_id].mode = value;
							s.ui.mixer.channels[channel_id].duration = 0;
						}
					}
				}
				break;
			case 'ivr':
			case 'on_hold':
				switch (s.ui.mixer.channels[channel_id].mode) {
					case 'on_hold':
						errorMsg = "channel already on hold";
						break;
					case 'defunct':
					case 'free':
						errorMsg = "channel not acive";
						break;
					default:
						errorMsg = provider[s.channels[channel_id].provider].putOnHold(channel_id);
						if (!errorMsg) {
							s.ui.mixer.channels[channel_id].mode = value;
						}
				}
				break;
			case 'free':
				switch (s.ui.mixer.channels[channel_id].mode) {
					case 'defunct':
						errorMsg = "channel not active";
					case 'free':
						errorMsg = "channel already free";
						break;
					default:
						errorMsg = provider[s.channels[channel_id].provider].hangup(channel_id);
						if (!errorMsg) {
							s.ui.mixer.channels[channel_id].mode = value;
						}
				}
				break;
			default:
				if (!s.ui.mixer.hosts[value]) {
					errorMsg = 'invalid input value';
				} else {
					if (s.ui.mixer.hosts[value].mode == channel_id) {
						 errorMsg = 'host already connected with ' + channel_id;
					} else if (s.ui.mixer.hosts[value].conn === 'unreachable') {
						 errorMsg = 'host not reachable';
					} else {
						errorMsg = provider[s.channels[channel_id].provider].setChannelMode(channel_id, value);
					}
				}
		}
	}
	return errorMsg;
}
exports.getChannelInfo = function(channel_id) {

}
