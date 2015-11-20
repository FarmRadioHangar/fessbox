var provider = {};
provider.asterisk = require("./ami");

var currentProvider = 'asterisk';

var myLib = require("./myLib");
var s = require("./singleton");
var fessConfig = require("./config/fessbox.json");

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

s.ui.mixer.master = require("./state/master.json");

exports.connectNumbers = function (response, params) {
	var result = ami.connectNumbers(params.number1, params.number2);
	myLib.httpGeneric(200, result, response, "DEBUG::connectNumbers");
};

// returns null on success, error message on error
exports.setChannelVolume = function(channel_id, value, cb) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else {
		if (value > 100 || value < 0) {
			errorMsg = 'invalid input value';
		} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'free':
				case 'ring':
				case 'defunct':
					s.ui.mixer.channels[channel_id].level = value;
					cb(null,value);
					break;
				default:
					provider[currentProvider].setChannelVolume(channel_id, value, function (err) {
						if (err) {
							cb(err);
						} else {
							s.ui.mixer.channels[channel_id].level = value;
							cb(null,value);
						}
					});
			}
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setChannelVolume" , channel_id + ":" + errorMsg);
	}
}

// returns null on success, error message on error
exports.setMasterVolume = function(value, cb) {
	var errorMsg;
	if (value > 100 || value < 0) {
		errorMsg = 'invalid input value';
	} else {
		if (s.ui.mixer.master.on_air) {
			provider[currentProvider].setMasterVolume(value, function (err) {
				if (err) {
					cb(err);
				} else {
					s.ui.mixer.master.level = value;
					cb(null, s.ui.mixer.master.level);
				}
			});
		} else {
			s.ui.mixer.master.level = value;
			cb(null, s.ui.mixer.master.level);
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setMasterVolume" , errorMsg);
	}
}

exports.setMasterMuted = function(value, cb) {
	var errorMsg;
	if (typeof value != 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else {
		provider[currentProvider].setMasterMuted(value, function(err) {
			if (err) {
				cb(err);
			} else {
				s.ui.mixer.master.muted = value;
				cb(null, s.ui.mixer.master);
			}
		});
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setMasterMuted" , errorMsg);
	}
}

exports.setMasterOnAir = function(value) {
	var errorMsg;
	if (typeof value != 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else {
		errorMsg = provider[currentProvider].setMasterOnAir(value);
	}
	if (!errorMsg) {
		s.ui.mixer.master.on_air = value;
	} else {
		return errorMsg;
	}
}

exports.setChannelMuted = function(channel_id, value, cb) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else if (typeof value != 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'free':
				case 'ring':
				case 'defunct':
				case 'on_hold':
					s.ui.mixer.channels[channel_id].muted = value;
					cb(null, s.ui.mixer.channels[channel_id]);
					break;
				default:
					provider[currentProvider].setChannelMuted(channel_id, value, function (err) {
						if (err) {
							cb(err);
						} else {
							s.ui.mixer.channels[channel_id].muted = value;
							cb(null, s.ui.mixer.channels[channel_id]);
						}
					});
			}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setChannelMuted" , channel_id + ":" + errorMsg);
	}
};

exports.setChannelMode = function(channel_id, value, cb) {
//	[channel_id]: 'master' | 'ivr' | 'on_hold' | 'free' | host_id
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else {
		switch (value) {
			case 'master':
				if (s.ui.mixer.channels[channel_id].mode === 'master') {
					errorMsg = "channel already connected to master";
				} else {
					provider[currentProvider].connectToMaster(channel_id, function(err) {
						if (err) {
							cb(err);
						} else {
							if (s.ui.mixer.channels[channel_id].mode === 'ring') {
								s[currentProvider].channels[channel_id].timestamp = new Date().now;
								s.ui.mixer.channels[channel_id].mode = value;
								s.ui.mixer.channels[channel_id].duration = 0;
								cb(null, s.ui.mixer.channels[channel_id]);
							}
						}
					});
				}
				break;
			case 'ivr':
				break;
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
						provider[currentProvider].putOnHold(channel_id, function(err) {
							if (err) {
								cb(err);
							} else {
								s.ui.mixer.channels[channel_id].mode = value;
								cb(null, s.ui.mixer.channels[channel_id]);
							}
						});
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
						provider[currentProvider].hangup(channel_id, function(err) {
							if (err) {
								cb(err)
							} else { 
								s.ui.mixer.channels[channel_id].mode = value;
								cb(null, s.ui.mixer.channels[channel_id]);
							}
						});
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
						provider[currentProvider].connectToHost(channel_id, value, function(err) {
							if (err) {
								cb(err);
							} else {
								s.ui.mixer.channels[channel_id].mode = value;
								cb(null, s.ui.mixer.channels[channel_id]);
							}
						});
					}
				}
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setChannelMode" , channel_id + ":" + errorMsg);
	}
}

exports.setHostVolume = function (host_id, value, cb) {
	var errorMsg;
	if (!s.ui.mixer.hosts[host_id]) {
		errorMsg = 'host not found';
	} else if (!value || value > 100 || value < 0) {
			errorMsg = 'invalid input value';
	} else {
		if (s.ui.mixer.hosts[host_id]["level_" + value.direction] == value.level) {
			errorMsg = "value already set";
		} else {
//			if (!provider[currentProvider].setHostVolume) {
//				errorMsg = "function not implemented in " + currentProvider + " provider";
//			} else {
				if (s.ui.mixer.hosts[host_id].mode != 'free') {
					provider[currentProvider].setHostVolume(host_id, value, function (err) {
						if (err) {
							cb(err);
						} else {
							s.ui.mixer.hosts[host_id]["level_" + value.direction] = value.level;
//							cb(null, s.ui.mixer.hosts[host_id]);
						}
					});
				} else {
					s.ui.mixer.hosts[host_id]["level_" + value.direction] = value.level;
//					cb(null, s.ui.mixer.hosts[host_id]);
				}
//			}
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setHostVolume" , host_id + ":" + errorMsg);
	}
};

exports.setHostMuted = function (host_id, value, cb) {
	var errorMsg;
	if (!s.ui.mixer.hosts[host_id]) {
		errorMsg = 'host not found';
	} else if (!value || typeof value.muted != 'boolean') {
		errorMsg = 'invalid input value';
	} else {
		if (s.ui.mixer.hosts[host_id]["muted_" + value.direction] == value.muted) {
			errorMsg = "value already set";
		} else {
			if (!provider[currentProvider].setHostMuted) {
				errorMsg = "function not implemented in " + currentProvider + " provider";
			} else {
				if (s.ui.mixer.hosts[host_id].mode != 'free') {
					provider[currentProvider].setHostMuted(host_id, value, function (err) {
						if (err) {
							cb(err);
						} else {
							s.ui.mixer.hosts[host_id]["muted_" + value.direction] = value.muted;
							cb(null, s.ui.mixer.hosts[host_id]);
						}
					});
				} else {
					s.ui.mixer.hosts[host_id]["muted_" + value.direction] = value.muted;
					cb(null, s.ui.mixer.hosts[host_id]);
				}
			}
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setHostMuted" , host_id + ":" + errorMsg);
	}
};

exports.getChannelInfo = function(channel_id) {

}
