var api = require("./api");
/*
exports.channelMode = function(user_id, data, cb) {
	for(channel_id in data) {
		api.setChannelMode(user_id, channel_id, data[channel_id], function (err, channel) {
			if (err) {
				cb("event_error", {
					event: "channelMode",
					key: channel_id,
					msg: err
				}, 'self');
			} else {
				var changed = {};
				changed[channel_id] = channel;
				cb("channelUpdate", changed, 'all');
			}
		});
	}
};
*/

// stable 
exports.masterMuted = function(user_id, data, cb) {
	api.setMasterMuted(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterMuted",
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

exports.masterOnAir = function(user_id, data, cb) {
	api.setMasterOnAir(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "masterOnAir",
				msg: err
			}, 'self');
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
}

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

