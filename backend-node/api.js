var appConfig = require("./config/app.json");
var provider = require("./" + appConfig.provider);

var myLib = require("./myLib");
var s = require("./localStorage");
var wss = require("./websocket");

exports.setChannelMuted = function(channel_id, value, cbErr) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.channels[channel_id].muted) {
		errorMsg = 'value alredy set';
	} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'ivr':
					errorMsg = 'not applicable in IVR mode';
					break;
				case 'free':
				case 'ring':
				case 'defunct':
				case 'on_hold':
					channelUpdate(channel_id, { muted: value });
					break;
				default:
					provider.setChannelMuted(channel_id, value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							channelUpdate(channel_id, { muted: value });
						}
					});
			}
	}
	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setChannelMuted" , channel_id + ":" + errorMsg);
	}
};

exports.setChannelRecording = function(channel_id, value, cbErr) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.channels[channel_id].recording) {
		errorMsg = 'value alredy set';
	} else {
			switch (s.ui.mixer.channels[channel_id].mode) {
				case 'ivr':
					errorMsg = 'not applicable in IVR mode';
					break;
				case 'free':
				case 'ring':
				case 'defunct':
				case 'on_hold':
					channelUpdate(channel_id, { recording: value });
					break;
				default:
					provider.setChannelRecording(channel_id, value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							channelUpdate(channel_id, { recording: value });
						}
					});
			}
	}
	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setChannelRecording" , channel_id + ":" + errorMsg);
	}
};

exports.setChannelMode = function(channel_id, value, cbErr) {
	myLib.consoleLog('debug', "setChannelMode", "setting " + channel_id + " from " + s.ui.mixer.channels[channel_id].mode + " to " + value);
	 myLib.consoleLog('debug', "setChannelMode", s.ui.mixer.channels);
	 myLib.consoleLog('debug', "setChannelMode", s.asterisk.channels);
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else if (s.ui.mixer.hosts.indexOf(channel_id) !== -1) {
		// if channel is host, mode can't be changed from client
		errorMesage = "host mode can't be changed from client";
	} else {
		var cb = function(err, res) {
			if (err) {
				cbErr(err);
			} else {
				var modify = {};
				if (s.ui.mixer.channels[channel_id].mode === 'ring') {
					modify.timestamp = Date.now();
				}
				if (value === 'free') {
					modify.timestamp = null;
					modify.direction = null;
					modify.contact = null;
				}
				modify.mode = value;
				channelUpdate(channel_id, modify);
			}
		};
		switch (s.ui.mixer.channels[channel_id].mode) {
			case 'defunct':
				errorMsg = "can't change efunct channel";
				break;
			case 'free':
				myLib.consoleLog('debug', "setChannelMode", "mode free: doing nothing for now");
				break;
			case 'ivr':
				if (value !== 'free') {
					errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
				} else {
					provider.setChanMode(channel_id, value, cb);
				}
				break;
			case 'ring':
			case 'on_hold':
			case 'master':
				switch (value) {
					case s.ui.mixer.channels[channel_id].mode:
						errorMsg = "channel already connected to " + value;
						break;
					case 'master':
					case 'free':
					case 'on_hold':
					case 'ivr':
						provider.setChanMode(channel_id, value, cb);
						break;
					default:
						if (!s.ui.mixer.channels[value]) {
							errorMsg = "invalid mode, cannot change from " + s.ui.mixer.channels[channel_id].mode + " to " + value;
						} else {
							switch (s.ui.mixer.channels[value].mode) { // mode of the channel that we're connecting to
								case 'ivr':
									errorMsg = "can't connect to channel in IVR mode";
									break;
								case 'free':
								case 'ring':
								case 'master':
								case 'on_hold':
//									provider.setChanMode(value, channel_id, cb);
//									provider.setChanMode(channel_id, value, cb);
//									break;
								case 'master':
									provider.setChanMode2(channel_id, value, cb);
									/*
									provider.parkCall(value, function(err, res) {
										if (err) {
											cbErr(err);
										} else {
											provider.setChanMode(channel_id, "71", cb);
										}
									});
									provider.setChanMode(value, 'on_hold', function(err, res) {
										if (err) {
											cbErr(err);
										} else {
											myLib.consoleLog('debug', 'parking', JSON.stringify(res));
											provider.setChanMode(channel_id, value, cb);
											//provider.setChanMode(channel_id, "71", cb);
										}
									});
								   */
									break;
								default:
									provider.setChanModes(channel_id, value, s.ui.mixer.channels[value].mode, 'on_hold', cb);
							}
						}
				}
				break;
			default:
				switch (value) {
					case s.ui.mixer.channels[channel_id].mode:
						errorMsg = "channel already connected to " + value;
						break;
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
							if (s.ui.users[s.ui.mixer.channels[channel_id].mode]) {
								//channel is currently connected to a host, so we redirect the host to master
								provider.setChanModes(channel_id, value, s.ui.mixer.channels[channel_id].mode, 'master', cb);
							} else {
								//channel is currently connected to an operator (or audience channel)
								provider.setChanMode(channel_id, value, cb);
							}
						}
				}
		}
	}

	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setChannelMode" , channel_id + ":" + errorMsg);
	}

}

/*
exports.setChannelMode = function(host_id, channel_id, value, cb) {
//	[channel_id]: 'master' | 'ivr' | 'on_hold' | 'free' | host_id
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'channel not found';
	} else {
		switch (value) {
			case 'master':
				switch (s.ui.mixer.channels[channel_id].mode) {
					case 'master':
						errorMsg = "channel already connected to master";
						break;
					case 'ring':
						if (host_id && s.ui.mixer.hosts[host_id].mode === 'free') {
							provider.hostToMaster(host_id, function(err) {
								if (err) {
									cb(err);
								} else {
									s.ui.mixer.hosts[host_id].mode = 'master';
									var newHost = {};
									newHost[host_id] = s.ui.mixer.hosts[host_id];
									wss.broadcastEvent("hostUpdate", newHost);
								}
							});
						}
					case 'ivr':
					case 'on_hold':
						provider.channelToMaster(channel_id, function(err) {
							if (err) {
								cb(err);
							} else {
								s[currentProvider].channels[channel_id].timestamp = new Date().now;
								s.ui.mixer.channels[channel_id].mode = 'master';
								s.ui.mixer.channels[channel_id].duration = 0;
								cb(null, s.ui.mixer.channels[channel_id]);
							}
						});
						break;
					default:
						//todo: find out why the hell mode is 'number'
						if (s.ui.mixer.channels[channel_id].mode == host_id) {
							provider.toMaster(host_id, channel_id, function(err) {
								if (err) {
									cb(err);
								} else {
									s[currentProvider].channels[channel_id].timestamp = new Date().now;
									s.ui.mixer.channels[channel_id].mode = 'master';
									s.ui.mixer.channels[channel_id].duration = 0;
									cb(null, s.ui.mixer.channels[channel_id]);

									s.ui.mixer.hosts[host_id].mode = 'master';
									var newHost = {};
									newHost[host_id] = s.ui.mixer.hosts[host_id];
									wss.broadcastEvent("hostUpdate", newHost);
								}
							});
						}
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
						provider.putOnHold(channel_id, function(err) {
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
						provider.hangup(channel_id, function(err) {
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
					switch (s.ui.mixer.hosts[value].mode) {
						case 'master':
							provider.connectToHost(channel_id, value, function(err) {
								if (err) {
									cb(err);
								} else {
									s.ui.mixer.channels[channel_id].mode = host_id;
									cb(null, s.ui.mixer.channels[channel_id]);
									var newHost = {};
									newHost[host_id] = s.ui.mixer.hosts[host_id];
									wss.broadcastEvent("hostUpdate", newHost);
								}
							});

							break;
						default:
							if (s.ui.mixer.hosts[value].mode == channel_id) {
								errorMsg = 'host already connected with ' + channel_id;
							} else if (!s.ui.mixer.channels[s.ui.mixer.hosts[value].mode]) {
								errorMsg = 'WTF';
							} else {
								provider.putOnHold(s.ui.mixer.hosts[value].mode, function (err) {
									if (err) {
										cb(err);
									} else {
										s.ui.mixer.channels[s.ui.mixer.hosts[value].mode].mode = 'on_hold';
										// todo: add to object that gets sent back, instead of firing separate event
										var modifiedChannels = {};
										modifiedChannels[s.ui.mixer.hosts[value].mode] = s.ui.mixer.channels[s.ui.mixer.hosts[value].mode];
										wss.broadcastEvent("channelUpdate", modifiedChannels);

										provider.connectToHost(channel_id, value, function(err) {
											if (err) {
												cb(err);
											} else {
												s.ui.mixer.channels[channel_id].mode = value;
												cb(null, s.ui.mixer.channels[channel_id]);
											}
										});
									}
								});
							}
					}

					if (s.ui.mixer.hosts[value].mode == channel_id) {
						errorMsg = 'host already connected with ' + channel_id;
					} else if (s.ui.mixer.hosts[value].conn === 'unreachable') {
						errorMsg = 'host not reachable';
					} else {
						provider.connectToHost(channel_id, value, function(err) {
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
*/

exports.setUserVolume = function (channel_id, value, cb) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id] || !s.ui.users[channel_id]) {
		errorMsg = 'user not found';
	} else if (value === null || value > 100 || value < 0) {
			errorMsg = 'invalid input value';
	} else if (s.ui.users[channel_id].level === value) {
			errorMsg = "value already set";
	} else {
		if (s.ui.mixer.channels[channel_id].mode != 'free') {
			provider.setUserVolume(channel_id, value, function (err) {
				if (err) {
					cb(err);
				} else {
					s.ui.users[channel_id].level = value;
				}
			});
		} else {
			s.ui.users[channel_id].level = value;
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setUserVolume" , channel_id + ":" + errorMsg);
	}
};

exports.setUserMuted = function (channel_id, value, cb) {
	var errorMsg;
	if (!s.ui.mixer.channels[channel_id]) {
		errorMsg = 'user not found';
	} else if (value === null || typeof value !== 'boolean') {
		errorMsg = 'invalid input value';
	} else if (s.ui.users[channel_id].muted === value) {
		errorMsg = "value already set";
	} else {
		console.log('mode', s.ui.mixer.channels[channel_id].mode);
		if (s.ui.mixer.channels[channel_id].mode !== 'free') {
			provider.setUserMuted(channel_id, value, function (err) {
				if (err) {
					cb(err);
				} else {
					s.ui.users[channel_id].muted = value;
					cb(null, s.ui.users[channel_id]);
				}
			});
		} else {
			s.ui.users[channel_id].muted = value;
			cb(null, s.ui.users[channel_id]);
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setUserMuted" , channel_id + ":" + errorMsg);
	}
};

exports.getChannelInfo = function(channel_id) {

}

// input interface
exports.setChannelProperty = function(channel_id, name, value, cbErr) {
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
			exports.setChannelVolume(channel_id, value, function(err) {
				if (err) {
					cbErr(err);
				} else {
					var changed = {};
					changed[channel_id] = s.ui.mixer.channels[channel_id];
					wss.broadcast("channelUpdate", changed);
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

exports.setMasterProperty = function(name, value, cbErr) {
	switch(name) {
		case 'muted':
			exports.setMasterMuted(value, cbErr);
			break;
		case 'on_air':
			exports.setMasterOnAir(value, cbErr);
			break;
		case 'recording':
			exports.setMasterRecording(value, cbErr);
			break;
		case 'level':
			exports.setMasterVolume(value, function(err) {
				if (err) {
					cbErr(err);
				} else {
					wss.broadcast("masterUpdate", s.ui.mixer.master);
				}
			});
			break;
		default:
			var errorMsg = "Unknown master property: " + name;
			cbErr(errorMsg);
	}
};

exports.setMasterRecording = function(value, cbErr) {
	var errorMsg;
	if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.master.recording) {
		errorMsg = 'value alredy set';
	} else {
			switch (s.ui.mixer.master.mode) {
				case 'ivr':
					errorMsg = 'not applicable in IVR mode';
					break;
				case 'free':
				case 'ring':
				case 'defunct':
				case 'on_hold':
					masterUpdate({ recording: value });
					break;
				default:
					provider.setMasterRecording(value, function (err) {
						if (err) {
							cbErr(err);
						} else {
							masterUpdate({ recording: value });
						}
					});
			}
	}
	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setMasterRecording", errorMsg);
	}
}


exports.setMasterMuted = function(value, cbErr) {
	var errorMsg;
	if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.master.muted) {
		errorMsg = 'value alredy set';
	} else {
		provider.setMasterMuted(value, function(err) {
			if (err) {
				cbErr(err);
			} else {
				masterUpdate({ muted: value });
			}
		});
	}
	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setMasterMuted" , errorMsg);
	}
}

exports.setMasterOnAir = function(value, cbErr) {
	if (typeof value !== 'boolean') {
		errorMsg = 'invalid input value, boolean required';
	} else if (value === s.ui.mixer.master.on_air) {
		errorMsg = 'value alredy set';
	} else {
		provider.setMasterOnAir(value, function(err) {
			if (err) {
				cbErr(err);
			} else {
				masterUpdate({ on_air: value });
			}
		});
	}
	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setMasterOnAir`" , errorMsg);
	}
}

exports.setMasterVolume = function(value, cb) {
	var errorMsg;
	if (value > 100 || value < 0) {
		errorMsg = 'invalid input value';
	} else {
		if (s.ui.mixer.master.on_air) {
			provider.setMasterVolume(value, function (err) {
				cb(err);
				if (!err) {
					s.ui.mixer.master.level = value;
				}
			});
		} else {
			cb();
			s.ui.mixer.master.level = value;
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setMasterVolume" , errorMsg);
	}
};

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
					cb();
					s.ui.mixer.channels[channel_id].level = value;
					break;
				default:
					provider.setChannelVolume(channel_id, value, function (err) {
						cb(err);
						if (!err) {
							s.ui.mixer.channels[channel_id].level = value;
						}
					});
			}
		}
	}
	if (errorMsg) {
		cb(errorMsg);
		myLib.consoleLog('error', "setChannelVolume" , channel_id + ":" + errorMsg);
	}
};

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
				if (s.ui.users[value]) {
					channelUpdate(channel_id, { autoanswer: value });
				} else {
					errorMsg = "invalid autoanswer value: " + value;
				}
		}
	}
	if (errorMsg) {
		cbErr(errorMsg);
		myLib.consoleLog('error', "setChannelAutoanswer" , channel_id + ":" + errorMsg);
	}
};

// output interface
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
function channelUpdate(channel_id, data) {
	var changed = false;
	if (!s.ui.mixer.channels[channel_id]) {
		s.ui.mixer.channels[channel_id] = data;
		changed = true;
	} else {
		for (key in data) {
			if (s.ui.mixer.channels[channel_id][key] !== data[key]) {
				s.ui.mixer.channels[channel_id][key] = data[key];
				changed = true;
			} else {
				myLib.consoleLog('warning', "channelUpdate: value already set", [channel_id, key, data[key]]);
			}
		}
	}
	if (changed) {
		var changedChannel = {};
		changedChannel[channel_id] = s.ui.mixer.channels[channel_id];
		wss.broadcastEvent("channelUpdate", changedChannel);
	}
}
exports.channelUpdate = channelUpdate;
exports.masterUpdate = masterUpdate;

