var uuid = require("node-uuid");

var appConfig = require("./config/app.json");
var pbxProvider = require("./" + appConfig.pbxProvider);
var addressBook = require("./" + appConfig.addressBook);

var contentProviders = {
	'sms_out': pbxProvider
};
var mixerLib = require("./mixerLib");
var myLib = require("./myLib");
var s = require("./localStorage");
var wss = require("./websocket");

exports.getCurrentState = function (operator_id, cb) {
	//console.log('operators', operator_id, JSON.stringify(s.ui.operators[operator_id]));
	var operators;
	if (operator_id) {
		operators = {};
		if (s.ui.operators[operator_id]) {
			operators[operator_id] = s.ui.operators[operator_id];
		}
	}
	s.messages.fetch(50, null, function (err, messages) {
		if (err) {
			myLib.consoleLog('error', "messages.fetch", err);
		}
		var currentState = {
			mixer: s.ui.mixer,
			users: operators, // deprecated
			operators: operators,
			inbox: messages,
			server_time: Date.now()
		};
		cb(null, currentState);
	});
};

// inbox

exports.inboxFetch = function (count, reference_id, cb) {
	if (!count) {
		count = 50;
	}
	s.messages.fetch(count, reference_id, cb);
};

exports.messageSend = function (data, cb) {
	contentProviders[data.type].sendContent(data, cb);
};

exports.messageDelete = function (data, cbErr) {
	s.messages.delete(Object.keys(data), cbErr);
};

exports.callNumber = function (number, mode, channel_id, cbErr) {
	var errorMsg;
	if (channel_id) {
		if (!s.ui.mixer.channels[channel_id]) {
			errorMsg = 'channel not found';
		} else if (s.ui.mixer.channels[channel_id].mode !== 'free') {
			errorMsg = channel_id + ' is currently busy';
		}
	} else {
		//todo: find available channel for dial-out
		channel_id = "airtel1"; //temp
		//errorMsg = 'all lines are busy';
	}
	if (errorMsg) {
		cbErr(errorMsg);
	} else {
		// check if destination mode is valid
		switch (mode) {
			case "ivr":
			case "on_hold":
				pbxProvider.originateRemote(number, mode, channel_id, cbErr);
				break;
			case "master":
				pbxProvider.originateLocal(number, mode, channel_id, cbErr);
				break;
			// operator_id (channel_id) of local endpoint
			default:
				if (!s.ui.operators[mode]) {
					cbErr('invalid call-out mode');
				} else if (s.ui.mixer[mode].mode !== 'free') {
					cbErr(mode + " is currently busy");
				} else {
					pbxProvider.originateLocal(number, mode, channel_id, cbErr);
				}
		}
	}
};

// channels

exports.setChannelVolume = function (channel_id, value, cb) {
	if (!s.ui.mixer.channels[channel_id]) {
		cb('channel not found');
	} else {
		if (value > 100 || value < 0) {
			cb('invalid input value');
		} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'free':
				case 'ring':
				case 'defunct':
					s.ui.mixer.channels[channel_id].level = value;
					cb();
					break;
				default:
					pbxProvider.setChannelVolume(channel_id, value, function (err) {
						if (!err) {
							s.ui.mixer.channels[channel_id].level = value;
						}
						cb(err);
					});
			}
		}
	}
};

exports.setChannelProperty = function (channel_id, name, value, cbErr) {
	switch(name) {
		case 'muted':
			exports.setChannelMuted(channel_id, value, cbErr);
			break;
		case 'mode':
			exports.setChannelMode(channel_id, value, cbErr);
			break;
		case 'autoanswer':
			exports.setChannelAutoanswer(channel_id, value, cbErr);
			break;
		case 'recording':
			exports.setChannelRecording(channel_id, value, cbErr);
			break;
		case 'level':
			exports.setChannelVolume(channel_id, value, function (err) {
				if (err) {
					cbErr(err);
				} else {
					channelEvent([channel_id]);
				}
			});
			break;
		case 'timestamp':
		case 'number':
		case 'type':
			cbErr(name + " is a read-only property");
		default:
			cbErr("Unknown channel property: " + name);
	}
};

exports.setChannelContactInfo = function (channel_id, data, cbErr) {
	for (key in data) {
		s.ui.mixer.channels[channel_id].contact[key] = data[key];
	}
	s.ui.mixer.channels[channel_id].contact.modified = true;
};

exports.setChannelMuted = function (channel_id, value, cbErr) {
	if (!s.ui.mixer.channels[channel_id]) {
		cbErr('channel not found');
	} else if (typeof value !== 'boolean') {
		cbErr('invalid input value, boolean required');
	} else if (value === s.ui.mixer.channels[channel_id].muted) {
		cbErr('value alredy set');
	} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'ivr':
					cbErr('not applicable in IVR mode');
					break;
				case 'free':
				case 'ring':
				case 'defunct':
				case 'on_hold':
					s.ui.mixer.channels[channel_id].muted = value;
					channelEvent([channel_id]);
					break;
				default:
					pbxProvider.setChannelMuted(channel_id, value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							s.ui.mixer.channels[channel_id].muted = value;
							channelEvent([channel_id]);
						}
					});
			}
	}
};

exports.setChannelRecording = function (channel_id, value, cbErr) {
	if (!s.ui.mixer.channels[channel_id]) {
		cbErr('channel not found');
	} else if (typeof value !== 'boolean') {
		cbErr('invalid input value, boolean required');
	} else if (value === s.ui.mixer.channels[channel_id].recording) {
		cbErr('value alredy set');
	} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'ivr':
					cbErr('not applicable in IVR mode');
					break;
				case 'free':
				case 'ring':
				case 'defunct':
				case 'on_hold':
					s.ui.mixer.channels[channel_id].recording = value;
					channelEvent([channel_id]);
					break;
				default:
					pbxProvider.setChannelRecording(channel_id, value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							s.ui.mixer.channels[channel_id].recording = value;
							channelEvent([channel_id]);
						}
					});
			}
	}
};

exports.setChannelMode = function (channel_id, value, cbErr) {
	myLib.consoleLog('debug', "setChannelMode", "setting " + channel_id + " from " + s.ui.mixer.channels[channel_id].mode + " to " + value);
//	 myLib.consoleLog('debug', "setChannelMode", s.ui.mixer.channels);
//	 myLib.consoleLog('debug', "setChannelMode", s.asterisk.channels);
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
//	} else if (s.ui.mixer.hosts.indexOf(channel_id) !== -1) {
//		// if channel is host, mode can't be changed from client
//		errorMsg = "host mode can't be changed from client";
	} else {
		var cb = function (err) {
			if (err) {
				cbErr(err);
			} else {
				changeMode(channel_id, value);
			}
		};
		var cbHangup = function (err) {
			if (err) {
				cbErr(err);
			} else if (mixerLib.channelMode(channel_id, { mode: value })) {
				mixerLib.channelUpdateEvent([channel_id]);
			}
		};
		switch (s.ui.mixer.channels[channel_id].mode) {
			case value:
				errorMsg = "mode already set to " + value;
				break;
			case 'defunct':
				errorMsg = "can't change defunct channel";
				break;
			case 'free':
				if (s.ui.mixer.channels[channel_id].direction === 'operator' && value === 'master') {
					pbxProvider.userToMaster(channel_id, cb);
				} else {
					errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
				}
				break;
			case 'ivr':
			case 'dial':
				if (value === 'free') {
					pbxProvider.setChanFree(channel_id, cbHangup);
				} else {
					errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
				}
				break;
			case 'ring':
				if (value !== 'free' && s.ui.mixer.channels[channel_id].direction === 'outgoing') {
					errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
					break;
				}
			case 'on_hold':
			case 'master':
				switch (value) {
					case 'free':
						pbxProvider.setChanFree(channel_id, cbHangup);
						break;
					case 'master':
					case 'on_hold':
					case 'ivr':
						pbxProvider.setChanMode(channel_id, value, cb);
						break;
					default:
						if (!s.ui.mixer.channels[value]) {
							errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
						} else {
							switch (s.ui.mixer.channels[value].mode) { // mode of the channel that we're connecting to
								case 'defunct':
								case 'ivr':
									errorMsg = "can't connect to channel in " + s.ui.mixer.channels[value].mode + " mode";
									break;
								case 'free':
									pbxProvider.setChanMode(channel_id, value, function (err) {
										if (err) {
											cbErr(err);
										} else {
											s.ui.mixer.channels[value].mode = channel_id;
											s.ui.mixer.channels[channel_id].mode = value;
											s.ui.mixer.channels[channel_id].timestamp = Date.now();
											channelEvent([channel_id, value]);
										}
									});
									break;
								case 'ring':
								case 'on_hold':
//									pbxProvider.setChanMode(value, channel_id, cb);
//									pbxProvider.setChanMode(channel_id, value, cb);
//									break;
								case 'master':
										pbxProvider.setChanModeBusy(channel_id, value, cb);
										//pbxProvider.setChanModeBusy(value, channel_id, cb);
									/*
									pbxProvider.parkCall(value, function (err, res) {
										if (err) {
											cbErr(err);
										} else {
											pbxProvider.setChanMode(channel_id, "71", cb);
										}
									});
									pbxProvider.setChanMode(value, 'on_hold', function (err, res) {
										if (err) {
											cbErr(err);
										} else {
											myLib.consoleLog('debug', 'parking', JSON.stringify(res));
											pbxProvider.setChanMode(channel_id, value, cb);
											//pbxProvider.setChanMode(channel_id, "71", cb);
										}
									});
								   */
									break;
								default:
									pbxProvider.setChanModes(channel_id, value, s.ui.mixer.channels[value].mode, 'on_hold', cb);
							}
						}
				}
				break;
			default: // channel_id is currently connected to other channel.
				console.log('channel_id is currently connected to other channel', s.ui.mixer.channels[channel_id].direction, value);

				if (s.ui.mixer.channels[channel_id].direction === 'operator') {
					if (value === 'master') {
						//pbxProvider.setChanModes(channel_id, value, s.ui.mixer.channels[channel_id].mode, 'master', cb); // send both to master
						var channel2_id = s.ui.mixer.channels[channel_id].mode;
						pbxProvider.setChanModes(channel_id, value, channel2_id, 'master', function (err) {
							if (err) {
								cbErr(err);
							} else {
								s.ui.mixer.channels[channel_id].mode = 'master';
								s.ui.mixer.channels[channel2_id].mode = 'master';
								channelEvent([channel_id, channel2_id]);
							}
						});
					} else {
						errorMsg = "invalid mode, cannot change operator from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
					}
				} else {
					switch (value) {
						case 'master':
						case 'free':
						case 'on_hold':
						case 'ivr':
							var destination = value;
						default:
							if (!destination) {
								if (!s.ui.mixer.channels[value]) {
									errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
								} else {
									destination = value;
								}
							}
							if (destination) {
								//if (s.ui.operators[s.ui.mixer.channels[channel_id].mode]) { // channel is currently connected to an operator
									//pbxProvider.setChanModes(channel_id, value, s.ui.mixer.channels[channel_id].mode, 'master', cb); // send both to master
								pbxProvider.setChanMode(channel_id, value, cb);
							}
					}
				}
		}
	}
	if (errorMsg) {
		cbErr(errorMsg);
	}
}

// user

exports.setOperatorVolume = function (channel_id, value, cbErr) {
	if (!s.ui.mixer.channels[channel_id] || !s.ui.operators[channel_id]) {
		cbErr('user not found');
	} else if (value === null || value > 100 || value < 0) {
		cbErr('invalid input value');
	} else if (s.ui.operators[channel_id].level === value) {
		cbErr("value already set");
	} else {
		switch (s.ui.mixer.channels[channel_id].mode) {
			case 'free':
			case 'defunct':
				s.ui.operators[channel_id].level = value;
				break;
			default:
				pbxProvider.setOperatorVolume(channel_id, value, function (err) {
					if (err) {
						cbErr(err);
					} else {
						s.ui.operators[channel_id].level = value;
					}
				});
		}
	}
};

exports.setOperatorRecording = function (channel_id, value, cb) {
	if (!s.ui.mixer.channels[channel_id]) {
		cb('user not found');
	} else if (typeof value !== 'boolean') {
		cb('invalid input value');
	} else if (s.ui.operators[channel_id].recording === value) {
		cb("value already set");
	} else {
		switch (s.ui.mixer.channels[channel_id].mode) {
			case 'free':
			case 'defunct':
				s.ui.operators[channel_id].recording = value;
				cb(null, s.ui.operators[channel_id]);
				break;
			default:
				pbxProvider.setOperatorRecording(channel_id, value, function (err) {
					if (err) {
						cb(err);
					} else {
						s.ui.operators[channel_id].recording = value;
						cb(null, s.ui.operators[channel_id]);
					}
				});
		}
	}
};

exports.setOperatorMuted = function (channel_id, value, cb) {
	if (!s.ui.mixer.channels[channel_id]) {
		cb('user not found');
	} else if (typeof value !== 'boolean') {
		cb('invalid input value');
	} else if (s.ui.operators[channel_id].muted === value) {
		cb("value already set");
	} else {
		switch (s.ui.mixer.channels[channel_id].mode) {
			case 'free':
			case 'defunct':
				s.ui.operators[channel_id].muted = value;
				cb(null, s.ui.operators[channel_id]);
				break;
			default:
				pbxProvider.setOperatorMuted(channel_id, value, function (err) {
					if (err) {
						cb(err);
					} else {
						s.ui.operators[channel_id].muted = value;
						cb(null, s.ui.operators[channel_id]);
					}
				});
		}
	}
};

// master

exports.setMasterVolume = function (value, cb) {
	if (!s.ui.mixer.master) {
		cb("master not connected");
	} else if (value > 100 || value < 0) {
		cb('invalid input value');
	} else {
		pbxProvider.setMasterVolume(value, function (err) {
			if (!err) {
				s.ui.mixer.master.level = value;
			}
			cb(err);
		});
	}
};

exports.setMasterProperty = function (name, value, cbErr) {
	switch(name) {
		case 'muted':
			exports.setMasterMuted(value, cbErr);
			break;
/*
		case 'on_air':
			exports.setMasterOnAir(value, cbErr);
			break;
*/
		case 'recording':
			exports.setMasterRecording(value, cbErr);
			break;
		case 'level':
			exports.setMasterVolume(value, function (err) {
				if (err) {
					cbErr(err);
				} else {
					wss.broadcastEvent("masterUpdate", s.ui.mixer.master);
				}
			});
			break;
		default:
			var errorMsg = "Unknown master property: " + name;
			cbErr(errorMsg);
	}
};

exports.setMasterMuted = function (value, cbErr) {
	if (!s.ui.mixer.master) {
		cbErr("master not connected");
	} else if (typeof value !== 'boolean') {
		cbErr('invalid input value, boolean required');
	} else if (value === s.ui.mixer.master.muted) {
		cbErr('value alredy set');
	} else {
		pbxProvider.setMasterMuted(value, function (err) {
			if (err) {
				cbErr(err);
			} else {
				s.ui.mixer.master.muted = value;
				wss.broadcastEvent("masterUpdate", s.ui.mixer.master);
			}
		});
	}
}
/*
exports.setMasterOnAir = function (value, cbErr) {
	if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.master.on_air) {
		errorMsg = 'value alredy set';
	} else {
		pbxProvider.setMasterOnAir(value, function (err) {
			if (err) {
				cbErr(err);
			} else {
				masterUpdate({ on_air: value });
			}
		});
	}
	if (errorMsg) {
		cbErr(errorMsg);
	}
}
*/

// host

exports.setHostVolume = function (value, cb) {
	var errorMsg;
	if (!s.ui.mixer.host) {
		errorMsg = "host not connected";
	} else if (value > 100 || value < 0) {
		errorMsg = 'invalid input value';
	} else {
		pbxProvider.setHostVolume(value, function (err) {
			if (!err) {
				s.ui.mixer.host.level = value;
			}
			cb(err);
		});
	}
	if (errorMsg) {
		cb(errorMsg);
	}
};

exports.setHostMuted = function (value, cbErr) {
	var errorMsg;
	if (!s.ui.mixer.host) {
		errorMsg = "host not connected";
	} else if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.host.muted) {
		errorMsg = 'value alredy set';
	} else {
		pbxProvider.setHostMuted(value, function (err) {
			if (err) {
				cbErr(err);
			} else {
				s.ui.mixer.host.muted = value;
				wss.broadcastEvent("hostUpdate", s.ui.mixer.host);
			}
		});
	}
	if (errorMsg) {
		cbErr(errorMsg);
	}
}

// output interface
/*
function masterUpdate(data) {
	var changed = false;
	for (key in data) {
		if (s.ui.mixer.master[key] !== null) {
			if (s.ui.mixer.master[key] !== data[key]) {
				s.ui.mixer.master[key] = data[key];
				changed = true;
			} else {
				myLib.consoleLog('warning', "masterUpdate:  value already set", [key,  data[key]]);
			}
		} else {
			myLib.consoleLog('error', "masterUpdate: field not found", [key,  data[key]]);
		}
	}
	if (changed) {
		wss.broadcastEvent("masterUpdate", s.ui.mixer.master);
	}
}

function hostUpdate(data) {
	var changed = false;
	for (key in data) {
		if (s.ui.mixer.host[key] !== null) {
			if (s.ui.mixer.host[key] !== data[key]) {
				s.ui.mixer.host[key] = data[key];
				changed = true;
			} else {
				myLib.consoleLog('warning', "hostUpdate:  value already set", [key,  data[key]]);
			}
		} else {
			myLib.consoleLog('error', "hostUpdate: field not found", [key,  data[key]]);
		}
	}
	if (changed) {
		wss.broadcastEvent("hostUpdate", s.ui.mixer.host);
	}
}
*/
function channelEvent(channel_ids) {
	var updatedChannels = {};
	for(var i in channel_ids) {
		updatedChannels[channel_ids[i]] = s.ui.mixer.channels[channel_ids[i]];
	}
	wss.broadcastEvent("channelUpdate", updatedChannels);
}

function channelUpdate(channel_id, data) {
	var changed = false;
	if (!s.ui.mixer.channels[channel_id]) {
		if (data) {
			s.ui.mixer.channels[channel_id] = data;
			changed = true;
		}
	} else if (!data) {
		s.ui.mixer.channels[channel_id] = null;
		changed = true;
	} else {
		for (key in data) {
			if (key == 'mode' || s.ui.mixer.channels[channel_id][key] !== data[key]) { // temp. solution to a bug
			//if (s.ui.mixer.channels[channel_id][key] !== data[key]) {
				s.ui.mixer.channels[channel_id][key] = data[key];
				changed = true;
			} else {
				myLib.consoleLog('warning', "channelUpdate: value already set", [channel_id, key, data[key]]);
			}
		}
	}
	if (changed) {
		channelEvent([channel_id]);
	}
}

//todo: this should be part of channelUpdate, not a separate export.
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
	channelUpdate(channel_id, modify);
}


exports.channelUpdate = channelUpdate;
//exports.masterUpdate = masterUpdate;
exports.changeMode = changeMode;

// stubs

exports.setChannelAutoanswer = function (channel_id, value, cbErr) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else {
		switch (value) {
			case null:
			case 'ivr':
			case 'master':
			case 'on_hold':
				channelUpdate(channel_id, { autoanswer: value });
				break;
			default:
				if (s.ui.operators[value]) {
					channelUpdate(channel_id, { autoanswer: value });
				} else {
					errorMsg = "invalid autoanswer value: " + value;
				}
		}
	}
	if (errorMsg) {
		cbErr(errorMsg);
	}
};

exports.setMasterRecording = function (value, cbErr) {
	var errorMsg;
	if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.recording) {
		errorMsg = 'value alredy set';
	} else {
		pbxProvider.setMasterRecording(value, function (err) {
			if (err) {
				cbErr(err);
			} else {
				s.ui.mixer.master.recording = value;
				wss.broadcastEvent("masterUpdate", s.ui.mixer.master);
			}
		});
	}
	if (errorMsg) {
		cbErr(errorMsg);
	}
}


