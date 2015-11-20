var api = require("./api");
var s = require("./singleton");

exports.channelVolume = function(data, cb) {
	for(channel_id in data) {
		api.setChannelVolume(channel_id, data[channel_id], function (err, level) {
			if (err) {
				cb("event_error", {
					event: "channelVolume",
					key: channel_id,
					msg: err
				}, 'self');
			} else {
				var changed = {};
				changed[channel_id] = level;
				cb("channelVolumeChange", changed, 'others');
			}
		});
	}
};

exports.channelMode = function(data, cb) {
	for(channel_id in data) {
		api.setChannelMode(channel_id, data[channel_id], function (err, channel) {
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

exports.channelMuted = function(data, cb) {
	for(channel_id in data) {
		api.setChannelMuted(channel_id, data[channel_id], function (err, channel) {
			if (err) {
				cb("event_error", {
					event: "channelMuted",
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
/*
exports.hostOutputMuted = function(data, cb) {
	var changed = {};
	for(host_id in data) {
		var err = api.setHostOutputMuted(host_id, data[host_id]);
		if (err) {
			cb("event_error", {
				event: "hostOutputMuted",
				key: host_id,
				msg: err
			}, 'self');
		} else {
			changed[host_id] = s.ui.mixer.hosts[host_id];
		}
	}
	if (changed.length > 0) {
		cb("hostUpdate", changed, 'all');
	}
};

exports.hostInputMuted = function(data, cb) {
	var changed = {};
	for(host_id in data) {
		var err = api.setHostInputMuted(host_id, data[host_id]);
		if (err) {
			cb("event_error", {
				event: "hostInputMuted",
				key: host_id,
				msg: err
			}, 'self');
		} else {
			changed[host_id] = s.ui.mixer.hosts[host_id];
		}
	}
	if (changed.length > 0) {
		cb("hostUpdate", changed, 'all');
	}
};
*/

exports.hostVolume = function(data, cb) {
	for(host_id in data) {
		api.setHostVolume(host_id, data[host_id],  function (err, host) {
			if (err) {
				cb("event_error", {
					event: "hostVolume",
					key: host_id,
					msg: err
				}, 'self');
			}
		});
	}
};

exports.hostMuted = function(data, cb) {
	for(host_id in data) {
		api.setHostMuted(host_id, data[host_id],  function (err, host) {
			if (err) {
				cb("event_error", {
					event: "hostMuted",
					key: host_id,
					msg: err
				}, 'self');
			} else {
				var changed = {};
				changed[host_id] = host;
				cb("hostUpdate", changed, 'all');
			}
		});
	}
};

exports.masterVolume = function(data, cb) {
	api.setMasterVolume(data, function (err, level) {
		if (err) {
			cb("event_error", {
				event: "masterVolume",
				msg: err
			}, 'self');
		} else {
			cb("masterVolumeChange", level, "others");
		}
	});
};

exports.masterMuted = function(data, cb) {
	api.setMasterMuted(data, function (err, master) {
		if (err) {
			cb("event_error", {
				event: "masterMuted",
				msg: err
			}, 'self');
		} else {
			cb("masterUpdate", master, "all");
		}
	});
};

exports.masterOnAir = function(data, cb) {
	var err = api.setMasterOnAir(data);
		if (err) {
			cb("event_error", {
				event: "masterOnAir",
				msg: err
			}, 'self');
		} else {
			cb("masterUpdate", s.ui.mixer.master, "all");
		}
};
