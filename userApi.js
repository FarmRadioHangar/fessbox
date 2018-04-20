var logger = new (require("./logger"))(__filename);
var appConfig = require("./etc/app.json");
var pbxProvider = require("./" + appConfig.pbxProvider);
var addressBook = require("./" + appConfig.addressBook);

var contentProviders = {
	'sms_out': pbxProvider
};
var mixerLib = require("./mixerLib");
var s = require("./localStorage");
var wss = require("./websocket");
var qa = require('./q_a');

exports.getCurrentState = function (operator_id, cb) {
	//logger.error('operators', operator_id, JSON.stringify(s.ui.operators[operator_id]));
	var operators;
	if (operator_id) {
		operators = {};
		if (s.ui.operators[operator_id]) {
			operators[operator_id] = s.ui.operators[operator_id];
		}
	}
	s.messages.fetch(50, null, function (err, messages) {
		if (err) {
			logger.error('getCurrentState', "messages.fetch", err);
		}
		var currentState = {
			lines: pbxProvider.lines,
			mixer: s.ui.mixer,
			operators: operators,
			inbox: messages, // deprecated
			server_version: 'v' + require("./package").version,
			server_time: Date.now()
		};
		//todo: configure this somewhere
		currentState.lines["uliza_fm"].agents = qa.getAgents();
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

exports.messagesFavoriteSet = function (data, cb) {
	// data is array of message ids
	s.messages.favoriteSet(data, function(err, result) {
		//logger.debug(data, ['messageFavSet'], result);
		cb(err, result);
	});
};

exports.messagesFavoriteUnset = function (data, cb) {
	// data is array of message ids
	s.messages.favoriteUnset(data, function(err, result) {
		//logger.debug(data, ['messageFavUnset'], result);
		cb(err, result);
	});
};

exports.messagesTag = function (data, cb) {
	s.messages.tag(data.message_ids, data.tags, function(err, result) {
		//logger.debug(data, ['messageTags'], result);
		cb();
	});
};

exports.messagesUntag = function (data, cb) {
	s.messages.untag(data.message_ids, data.tags, function(err, result) {
		//logger.debug(data, ['messageTags'], result);
		cb();
	});
};

exports.messageDelete = function (data, cbErr) {
	s.messages.delete(Object.keys(data), cbErr);
};

exports.callNumber = function (data, cbErr) {
	let line = pbxProvider.lines[data.line_id];
	function cb (err) {
		if (!err) {

			let channel_id = line.type === 'dongle' ? data.line_id : [data.line_id, data.number].join(':');
			let channel = {
				type: line.type,
				number: line.number,
				level: 67,
				direction: 'outgoing',
				label: line.name,
				mode: 'ring',
				muted: false,
				timestamp: Date.now(),
				contact: {
					number: data.number,
					//name:  s.ui.mixer[channel_id].contact.name;
				},
				recording: false,
			};
			if (mixerLib.channelCreate(channel_id, channel) || mixerLib.channelUpdateProperties(channel_id, channel)) {
				mixerLib.channelUpdateEvent([channel_id]);
			}
			/*
			logger.json({
				endpoint: data.endpoint,
				channel_id: data.channel_id,
				type: "dongle", //channel type
				direction: "out"
			}, ["telegraf"], ["call"], { message: { value: 1 }}, data.content);
			*/
		}
		cbErr(err);
	}

	if (data.line_id) {
		if (!line) {
			return cbErr('line not found');
		} else if (line.status !== 'free') {
			return cbErr(data.line_id + ' is currently ' + line.status);
		}
	}
	// check if destination mode is valid
	switch (data.mode) {
		case "ivr":
		case "on_hold":
			pbxProvider.originate(data.number, data.mode, data.line_id, true, cb);
			break;
		case "master":
			pbxProvider.originate(data.number, data.mode, data.line_id, data.waitAnswer, cb);
			break;
		// operator_id (channel_id) of local endpoint
		default:
			if (!s.ui.operators[data.mode]) {
				cbErr('invalid call-out mode');
			} else if (s.ui.mixer.channels[data.mode].mode !== 'free') {
				cbErr("operator " + data.mode + " is currently busy");
			} else {
				pbxProvider.originate(data.number, data.mode, data.line_id, false, cb);
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
				case 'defunct':
					s.ui.mixer.channels[channel_id].level = value;
					cb();
					break;
				case 'ring':
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
					mixerLib.channelUpdateEvent([channel_id]);
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

// this is a very temporary solution, until we figure out how to handle contacts
// only 'data.name' field is currently saved
exports.setChannelContactInfo = function (channel_id, data, cbErr) {
	let channel = s.ui.mixer.channels[channel_id];
	if (channel && channel.contact) {
		let modified = false;
		for (let key in data) {
			if (channel.contact[key] !== data[key]) {
				channel.contact[key] = data[key];
				modified = true;
			}
		}
		if (modified) {
			pbxProvider.setPhoneBookEntry(channel.contact.number, channel.contact.name);
		}
	} else {
		cb("Channel not active, operation can't be completed");
	}
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
				case 'defunct':
					s.ui.mixer.channels[channel_id].muted = value;
					mixerLib.channelUpdateEvent([channel_id]);
					break;
				case 'ring':
				case 'on_hold':
				default:
					pbxProvider.setChannelMuted(channel_id, value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							s.ui.mixer.channels[channel_id].muted = value;
							mixerLib.channelUpdateEvent([channel_id]);
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
				case 'defunct':
					s.ui.mixer.channels[channel_id].recording = value;
					mixerLib.channelUpdateEvent([channel_id]);
					break;
				case 'on_hold':
				case 'ring':
				default:
					pbxProvider.setChannelRecording(channel_id, value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							s.ui.mixer.channels[channel_id].recording = value;
							mixerLib.channelUpdateEvent([channel_id]);
						}
					});
			}
	}
};

exports.setChannelMode = function (channel_id, new_mode, cbErr) {
	var channel = s.ui.mixer.channels[channel_id];
	function userError(msg) {
		logger.warning('setChannelMode', msg);
		cbErr(msg);
	}
	if (!channel) {
		userError('channel not found');
	} else {
		logger.debug("setChannelMode on", channel_id, "from", channel.mode, "to", new_mode);
		function invalidMode(errorMsg) {
			userError(errorMsg || "invalid mode, can't change " + channel.type + " from " + channel.mode + " to " + new_mode);
		}
		var cb = function (err) {
			if (err) {
				cbErr(err);
			} else if (!new_mode) {
				mixerLib.channelUpdateProperties(channel_id, null) && mixerLib.channelUpdateEvent([channel_id]);
			} else {
				var old_mode = channel.mode;
				if (mixerLib.channelMode(channel_id, { mode: new_mode })) {
					mixerLib.channelUpdateEvent([channel_id]);
					if (old_mode === 'ring' && new_mode === 'master') {
						logger.json({
							endpoint: channel.contact.number,
							label: channel.label,
							type: channel.type,
							direction: channel.direction,
							status: 'answered'
						}, ["telegraf"], ["mixer"], { call: { value: 1 }}, "");
					}
				}
			}
		};
		switch (channel.mode) {
			case new_mode:
				invalidMode("channel mode already set to " + new_mode);
				break;
			case 'defunct':
				if (channel.type === 'dongle') {
					invalidMode("can't change defunct dongle channel");
				} else if (!new_mode) {
					cb();
				}
				break;
			case 'free':
				if (!new_mode) {
					channel.type === 'dongle' ? invalidMode() : cb();
				} else if (channel.direction === 'operator' && new_mode === 'master') {
					pbxProvider.userToMaster(channel_id, cb);
				} else {
					invalidMode();
				}
				break;
			case 'ivr':
			case 'dial':
				if (!new_mode || new_mode === 'free') {
					pbxProvider.setChanFree(channel_id, cb);
				} else {
					invalidMode();
				}
				break;
			case 'ring':
				if (new_mode && new_mode !== 'free' && channel.direction === 'outgoing') {
					invalidMode();
					break;
				}
			case 'on_hold':
			case 'master':
				switch (new_mode) {
					case null:
					case 'free':
						pbxProvider.setChanFree(channel_id, cb);
						break;
					case 'master':
					case 'on_hold':
					case 'ivr':
						pbxProvider.setChanMode(channel_id, new_mode, cb);
						break;
					default:
						if (!s.ui.mixer.channels[new_mode]) {
							invalidMode();
						} else {
							switch (s.ui.mixer.channels[new_mode].mode) { // mode of the channel that we're connecting to
								case 'defunct':
								case 'ivr':
									invalidMode("can't connect to channel in " + s.ui.mixer.channels[new_mode].mode + " mode");
									break;
								case 'free':
									pbxProvider.setChanMode(channel_id, new_mode, function (err) {
										if (err) {
											cbErr(err);
										} else {
											mixerLib.channelMode(new_mode, { mode: channel_id });
											channel.mode = new_mode;
											mixerLib.channelUpdateEvent([channel_id, new_mode]);
										}
									});
									break;
								case 'ring':
								case 'on_hold':
//									pbxProvider.setChanMode(new_mode, channel_id, cb);
//									pbxProvider.setChanMode(channel_id, new_mode, cb);
//									break;
								case 'master':
									pbxProvider.setChanModeBusy(channel_id, new_mode, cb);
									//pbxProvider.setChanModeBusy(new_mode, channel_id, cb);
									/*
									pbxProvider.parkCall(new_mode, function (err, res) {
										if (err) {
											cbErr(err);
										} else {
											pbxProvider.setChanMode(channel_id, "71", cb);
										}
									});
									pbxProvider.setChanMode(new_mode, 'on_hold', function (err, res) {
										if (err) {
											cbErr(err);
										} else {
											logger.debug('parking', JSON.stringify(res));
											pbxProvider.setChanMode(channel_id, new_mode, cb);
											//pbxProvider.setChanMode(channel_id, "71", cb);
										}
									});
								   */
									break;
								default:
									pbxProvider.setChanModes(channel_id, new_mode, s.ui.mixer.channels[new_mode].mode, 'on_hold', cb);
							}
						}
				}
				break;
			default: // channel_id is currently connected to other channel.
				logger.debug('setChannelMode', channel_id, 'is currently connected to other channel', channel.direction, new_mode);

				if (channel.direction === 'operator') {
					if (new_mode === 'master') {
						var channel2_id = channel.mode;
						pbxProvider.setChanModes(channel_id, new_mode, channel2_id, 'master', function (err) {
							if (err) {
								cbErr(err);
							} else {
								mixerLib.channelMode(channel_id, { mode: 'master' });
								s.ui.mixer.channels[channel2_id].mode = 'master';
								mixerLib.channelUpdateEvent([channel_id, channel2_id]);
							}
						});
					} else {
						invalidMode();
					}
				} else {
					switch (new_mode) {
						case 'master':
						case 'free':
						case 'on_hold':
						case 'ivr':
							var valid = true;
						default:
							if (valid || s.ui.mixer.channels[new_mode]) {
								pbxProvider.setChanMode(channel_id, new_mode, cb);
							} else {
								invalidMode();
							}
					}
				}
		}
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

// stubs

exports.setChannelAutoanswer = function (channel_id, value, cbErr) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else if (value === s.ui.mixer.channels[channel_id].autoanswer) {
		errorMsg = 'value alredy set';
	} else {
		switch (value) {
			case null:
			case 'ivr':
			case 'master':
			case 'on_hold':
				var valid = true;
			default:
				if (valid || s.ui.operators[value]) {
					s.ui.mixer.channels[channel_id].autoanswer = value;
					mixerLib.channelUpdateEvent([channel_id]);
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

exports.questionsFetch = function(count, reference_id, cb) {
	if (!count) {
		count = 50;
	}

	qa.getTickets().then(tickets => {
		let response = tickets.map(ticket => ({ id: ticket.id, data: ticket }));
		cb(null, response);
		// let count = tickets.length;
		// tickets.forEach(ticket => {
		// 	response[ticket.id] = ticket;
		// 	if (--count === 0) {
		// 		cb(null, response);
		// 	}
		// });
	});
}

exports.questionFavorite = function(data, cb) {
	qa.setFavorite(data, 1).then(updated => {
		cb(null, updated);
	})
	.catch(error => cb(error, null));
}

exports.questionUnfavorite = function(data, cb) {
	qa.setFavorite(data, 0).then(updated => {
		cb(null, updated);
	})
	.catch(error => cb(error, null));
}

exports.questionDelete = function(data, cb) {
	qa.deleteTickets(data).then(deleted => {
		cb(null, deleted);
	})
	.catch(error => cb(error, null));
}
