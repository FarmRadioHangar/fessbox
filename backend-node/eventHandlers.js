var userApi = require("./userApi");

exports.initialize = function (operator_id, data, cb) {
		userApi.getCurrentState(operator_id, function (err, initState) {
			cb("initialize", initState, 'self');
		});
};

exports.ping = function (operator_id, data, cb) {
	cb("pong", null, 'self');
};

exports.noop = function () {};

exports.callNumber = function (operator_id, data, cb) {
	userApi.callNumber(data.number, data.mode, data.channel_id, function (err) {
		if (err) {
			cb("event_error", {
				event: "callNumber",
				msg: err
			}, 'self');
		}
	});
};

exports.messageSend = function(operator_id, data, cb) {
	for (var temp_id in data) {
		userApi.messageSend(data[temp_id], function (err) {
			if (err) {
				cb("event_error", {
					event: "messageSend",
					key: temp_id,
					msg: err
				}, 'self');
			} else {
				cb("messageSent", temp_id, 'self');
			}
		});
	}
};

exports.messageDelete = function(operator_id, data, cb) {
	// todo: consider sending to all from userApi when really deleted, instead of updating only others right away
	// current version is more responsive and less consistent
	cb("inboxUpdate", data, 'others');
	userApi.messageDelete(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "messageDelete",
				msg: err
			}, 'self');
		}
	});
};

exports.inboxFetch = function(operator_id, data, cb) {
	userApi.inboxFetch(data.count, data.reference_id, function (err, messages) {
		if (err) {
			cb("event_error", {
				event: "inboxFetch",
				msg: err
			}, 'self');
		} else {
			cb("inboxMessages", messages, 'self');
		}
	});
};

exports.channelContactInfo = function(operator_id, data, cb) {
	cb("channelContactInfo", data, 'others');
	for(var channel_id in data) {
		userApi.setChannelContactInfo(channel_id, data[channel_id], function(err) {
			if (err) {
				cb("event_error", {
					event: "channelContactInfo",
					key: channel_id,
					msg: err
				}, 'self');
			}
		});
	}
};

// stable 

exports.masterProperty = function(operator_id, data, cb) {
	userApi.setMasterProperty(data.name,  data.value, function (err) {
		if (err) {
			cb("event_error", {
				event: "master::" + name,
				msg: err
			}, 'self');
		}
	});
};

exports.masterVolume = function(operator_id, data, cb) {
	userApi.setMasterVolume(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterVolume",
				msg: err
			}, 'self');
		} else {
			cb("masterVolumeChange", data, "others");
		}
	});
};

var setChannelProperty = function(channel_id, name, value, cb) {
	userApi.setChannelProperty(channel_id, name, value, function (err) {
		if (err) {
			cb("event_error", {
				event: "channel::" + name,
				key: channel_id,
				msg: err
			}, 'self');
		}
	});
};

exports.channelProperty = function(operator_id, data, cb) {
	for(var channel_id in data) {
		setChannelProperty(channel_id, data[channel_id].name,  data[channel_id].value, cb);
	}
};

exports.channelVolume = function(operator_id, data, cb) {
	for(var channel_id in data) {
		userApi.setChannelVolume(channel_id, data[channel_id], function (err) {
			if (err) {
				cb("event_error", {
					event: "channelVolume",
					key: channel_id,
					msg: err
				}, 'self');
			} else {
				var changed = {};
				changed[channel_id] = data[channel_id];
				cb("channelVolumeChange", changed, 'others');
			}
		});
	}
};

exports.userMuted = function(operator_id, data, cb) {
	for(var channel_id in data) {
		userApi.setUserMuted(channel_id, data[channel_id],  function (err, user) {
			if (err) {
				cb("event_error", {
					event: "userMuted",
					key: channel_id,
					msg: err
				}, 'self');
			} else {
				var changed = {};
				changed[channel_id] = user;
				cb("userUpdate", changed, 'self');
			}
		});
	}
};

exports.userVolume = function(operator_id, data, cb) {
	for(var channel_id in data) {
		userApi.setUserVolume(channel_id, data[channel_id],  function (err, user) {
			if (err) {
				cb("event_error", {
					event: "userVolume",
					key: channel_id,
					msg: err
				}, 'self');
			}
		});
	}
};

exports.hostVolume = function(operator_id, data, cb) {
	userApi.setHostVolume(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "hostVolume",
				msg: err
			}, 'self');
		} else {
			cb("hostVolumeChange", data, "others");
		}
	});
};

exports.hostMuted = function(operator_id, data, cb) {
	//userApi.setHostProperty('muted', data, function (err) {
	userApi.setHostMuted(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "hostMuted",
				msg: err
			}, 'self');
		}
	});
};

exports.channelRecording = function(operator_id, data, cb) {
	for(var channel_id in data) {
		setChannelProperty(channel_id, 'recording', data[channel_id], cb);
	}
};

exports.channelMuted = function(operator_id, data, cb) {
	for(var channel_id in data) {
		setChannelProperty(channel_id, 'muted', data[channel_id], cb);
	}
};

exports.channelMode = function(operator_id, data, cb) {
	for(var channel_id in data) {
		setChannelProperty(channel_id, 'mode', data[channel_id], cb);
	}
};

exports.masterMuted = function(operator_id, data, cb) {
	userApi.setMasterProperty('muted', data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterMuted",
				msg: err
			}, 'self');
		}
	});
};

exports.masterOnAir = function(operator_id, data, cb) {
	userApi.setMasterProperty('on_air', data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterOnAir",
				msg: err
			}, 'self');
		}
	});
};

