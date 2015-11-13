var api = require("./api");
var s = require("./singleton");

exports.channelVolume = function(data, cb) {
	var changed = {};
	for(channel_id in data) {
		var err = api.setChannelVolume(channel_id, data[channel_id]);
		if (err) {
			cb("event_error", {
				event: "channelVolume",
				key: channel_id,
				msg: err
			}, 'self');
		} else {
			changed[channel_id] = s.ui.mixer.channels[channel_id].level;
		}
	}
	if (changed.length > 0) {
		cb("channelVolumeChanged", changed, 'others');
	}
};

exports.channelMode = function(data, cb) {
	var changed = {};
	for(channel_id in data) {
		var err = api.setChannelMode(channel_id, data[channel_id]);
		if (err) {
			cb("event_error", {
				event: "channelMode",
				key: channel_id,
				msg: err
			}, 'self');
		} else {
			changed[channel_id] = s.ui.mixer.channels[channel_id];
		}
	}
	if (Object.keys(changed).length > 0) {
		cb("channelUpdate", changed, 'all');
	}
};

exports.channelMuted = function(data, cb) {
	var changed = {};
	for(channel_id in data) {
		var err = api.setChannelMuted(channel_id, data[channel_id]);
		if (err) {
			cb("event_error", {
				event: "channelMuted",
				key: channel_id,
				msg: err
			}, 'self');
		} else {
			changed[channel_id] = s.ui.mixer.channels[channel_id];
		}
	}
	if (changed.length > 0) {
		cb("channelUpdate", changed, 'all');
	}
};

exports.masterVolume = function(data, cb) {
	var err = api.setMasterVolume(data);
		if (err) {
			cb("event_error", {
				event: "masterVolume",
				msg: err
			}, 'self');
		} else {
			cb("masterVolumeChanged", s.ui.mixer.master.level, "others");
		}
};

exports.masterMuted = function(data, cb) {
	var err = api.setMasterMuted(data);
		if (err) {
			cb("event_error", {
				event: "masterMuted",
				msg: err
			}, 'self');
		} else {
			cb("masterUpdated", s.ui.mixer.master.level, "all");
		}
};

exports.masterOnAir = function(data, cb) {
	var err = api.setMasterOnAir(data);
		if (err) {
			cb("event_error", {
				event: "masterOnAir",
				msg: err
			}, 'self');
		} else {
			cb("masterUpdated", s.ui.mixer.master, "all");
		}
};
