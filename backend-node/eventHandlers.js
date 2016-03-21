var api = require("./api");

exports.callNumber = function () {
}

exports.messageSend = function(user_id, data, cb) {
	for (temp_id in data) {
		api.messageSend(data[temp_id], function (err) {
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

exports.messageDelete = function(user_id, data, cb) {
	cb("inboxUpdate", data, 'others');
	api.messageDelete(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "messageDelete",
				msg: err
			}, 'self');
		}
	});
};

exports.inboxFetch = function(user_id, data, cb) {
	api.inboxFetch(data.count, data.reference_id, function (err, messages) {
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

exports.channelContactInfo = function(user_id, data, cb) {
	cb("channelContactInfo", data, 'others');
	for (channel_id in data) {
		api.setChannelContactInfo(channel_id, data[channel_id], function(err) {
			if (err) {
				cb("event_error", {
					event: "channelContactInfo",
					msg: err
				}, 'self');
			}
		});
	}
};

// stable 

exports.masterProperty = function(user_id, data, cb) {
	api.setMasterProperty(data.name,  data.value, function (err) {
		if (err) {
			cb("event_error", {
				event: "master::" + name,
				msg: err
			}, 'self');
		}
	});
};

exports.masterVolume = function(user_id, data, cb) {
	api.setMasterVolume(data, function (err) {
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
	api.setChannelProperty(channel_id, name, value, function (err) {
		if (err) {
			cb("event_error", {
				event: "channel::" + name,
				key: channel_id,
				msg: err
			}, 'self');
		}
	});
};

exports.channelProperty = function(user_id, data, cb) {
	for(channel_id in data) {
		setChannelProperty(channel_id, data[channel_id].name,  data[channel_id].value, cb);
	}
};

exports.channelVolume = function(user_id, data, cb) {
	for(channel_id in data) {
		api.setChannelVolume(channel_id, data[channel_id], function (err) {
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

exports.userMuted = function(user_id, data, cb) {
	for(user_id in data) {
		api.setUserMuted(user_id, data[user_id],  function (err, user) {
			if (err) {
				cb("event_error", {
					event: "userMuted",
					key: user_id,
					msg: err
				}, 'self');
			} else {
				var changed = {};
				changed[user_id] = user;
				cb("userUpdate", changed, 'self');
			}
		});
	}
};

exports.userVolume = function(channel_id, data, cb) {
	for(channel_id in data) {
		api.setUserVolume(channel_id, data[channel_id],  function (err, user) {
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

exports.hostVolume = function(user_id, data, cb) {
	api.setHostVolume(data, function (err) {
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

exports.hostMuted = function(user_id, data, cb) {
	//api.setHostProperty('muted', data, function (err) {
	api.setHostMuted(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "hostMuted",
				msg: err
			}, 'self');
		}
	});
};

// obsolete
exports.channelRecording = function(user_id, data, cb) {
	for(channel_id in data) {
		setChannelProperty(channel_id, 'recording', data[channel_id], cb);
	}
};

exports.channelMuted = function(user_id, data, cb) {
	for(channel_id in data) {
		setChannelProperty(channel_id, 'muted', data[channel_id], cb);
	}
};

exports.channelMode = function(user_id, data, cb) {
	for(channel_id in data) {
		setChannelProperty(channel_id, 'mode', data[channel_id], cb);
	}
};

exports.masterMuted = function(user_id, data, cb) {
	api.setMasterProperty('muted', data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterMuted",
				msg: err
			}, 'self');
		}
	});
};

exports.masterOnAir = function(user_id, data, cb) {
	api.setMasterProperty('on_air', data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterOnAir",
				msg: err
			}, 'self');
		}
	});
};

