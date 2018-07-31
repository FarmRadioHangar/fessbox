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
	userApi.callNumber(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "callNumber",
				msg: err
			}, 'self');
		}
	});
};
//exports.messageSend = function(operator_id, data, cb) {
exports['messages:send'] = function(operator_id, data, cb) {
	for (var temp_id in data) {
		userApi.messageSend(data[temp_id], function (err) {
			if (err) {
				cb("event_error", {
					event: "messageSend",
					key: temp_id,
					msg: err
				}, 'self');
			} else {
				// cb("messageSent", temp_id, 'self');
				cb("messages:sent", temp_id, 'self');
			}
		});
	}
};
exports.messageSend = exports['messages:send'];

//exports.messageFavoriteSet = function(operator_id, data, cb) {
exports['messages:favorite'] = function(operator_id, data, cb) {
	userApi.messagesFavoriteSet(data, function(err, updated) {
		if (err) {
			cb("event_error", {
				event: "messageFavoriteSet",
				msg: err
			}, 'self');
		} else {
			// cb("inboxUpdate", updated, "others");
			cb("messages:update", updated, "others");
		}
	});
};

//exports.messageFavoriteUnset = function(operator_id, data, cb) {
exports['messages:unfavorite'] = function(operator_id, data, cb) {
	userApi.messagesFavoriteUnset(data, function(err, updated) {
		if (err) {
			cb("event_error", {
				event: "messageFavoriteUnset",
				msg: err
			}, 'self');
		} else {
			// cb("inboxUpdate", updated, "others");
			cb("messages:update", updated, "others");
		}
	});
};

//exports.messageTagsAdd = function(operator_id, data, cb) {
exports['messages:addTags'] = function(operator_id, data, cb) {
	userApi.messagesTag(data, function(err, updated) {
		if (err) {
			cb("event_error", {
				event: "messages:addTags",
				msg: err
			}, 'self');
		} else {
			// cb("inboxUpdate", updated, "others");
			cb("messages:update", updated, "others");
		}
	});
};

//exports.messageTagsRemove = function(operator_id, data, cb) {
exports['messages:removeTags'] = function(operator_id, data, cb) {
	userApi.messagesUntag(data, function(err, updated) {
		if (err) {
			cb("event_error", {
				event: "messages:removeTags",
				msg: err
			}, 'self');
		} else {
			// cb("inboxUpdate", updated, "others");
			cb("messages:update", updated, "others");
		}
	});
};

//exports.messageDelete = function(operator_id, data, cb) {
exports['messages:delete'] = function(operator_id, data, cb) {
	// todo: consider sending to all from userApi when really deleted, instead of updating only others right away
	// current version is more responsive and less consistent
	cb("messages:update", data, 'others');
	userApi.messageDelete(data, function (err) {
		if (err) {
			cb("event_error", {
				event: "messages:delete",
				msg: err
			}, 'self');
		}
	});
};

/**
[*] DEPRECATED FUNCTION
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
[*] DEPRECATED FUNCTION
**/

//exports.inboxFetchRange = function(operator_id, data, cb) {
exports['messages:fetch'] = function(operator_id, data, cb) {
	userApi.inboxFetchRange(data, function (err, messages) {
		if (err) {
			cb("event_error", {
				event: "messages:fetch",
				msg: err
			}, 'self');
		} else {
			// cb("inboxMessages", messages, 'self');
			cb("messages:list", messages, 'self');
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

//exports.questionsFetch = function(operator_id, data, cb) {
exports['questions:fetch'] = function(operator_id, data, cb) {
	userApi.questionsFetch(data, function(err, tickets) {
		if (err) {
			cb("event_error", {
				event: "questions:fetch",
				msg: err
			}, 'self');
		} else {
			// cb("questionsUpdate", tickets, 'self');
			cb("questions:list", tickets, 'self');
		}
	});
};

// exports.questionFavorite = function(operator_id, data, cb) {
exports['questions:favorite'] = function(operator_id, data, cb) {
	userApi.questionFavorite(data, function(error, updated) {
		if (error) {
			cb("event_error", {
				event: "questions:favorite",
				msg: error
			}, 'self');
		} else {
			// cb("questionsUpdate", updated);
			cb("questions:update", updated);
		}
	});
}

// exports.questionUnfavorite = function(operator_id, data, cb) {
exports['questions:unfavorite'] = function(operator_id, data, cb) {
	userApi.questionUnfavorite(data, function(error, updated) {
		if (error) {
			cb("event_error", {
				event: "questions:unfavorite",
				msg: error
			}, 'self');
		} else {
			// cb("questionsUpdate", updated);
			cb("questions:update", updated);
		}
	});
}

// exports.questionDelete = function(operator_id, data, cb) {
exports['questions:delete'] = function(operator_id, data, cb) {
	userApi.questionDelete(data, function(error, deleted) {
		if (error) {
			cb("event_error", {
				event: "questions:delete",
				msg: error
			}, 'self');
		} else {
			// cb("questionsUpdate", deleted);
			cb("questions:update", deleted);
		}
	});
}

// Call History Handlers
exports['calls:fetch'] = function(operator_id, data, cb) {
	userApi.callsFetch(data, function(error, calls) {
		if (error) {
			cb("event_error", {
				event: "calls:fetch",
				msg: error
			}, 'self');
		} else {
			cb("calls:list", calls, 'self');
		}
	});
};
exports['calls:favorite'] = function(operator_id, data, cb) {
	userApi.callsFavorite(data, function(error, updated) {
		if (error) {
			cb("event_error", {
				event: "calls:favorite",
				msg: error
			}, 'self');
		} else {
			cb("calls:update", updated);
		}
	});
};
exports['calls:unfavorite'] = function(operator_id, data, cb) {
	userApi.callsUnfavorite(data, function(error, updated) {
		if (error) {
			cb("event_error", {
				event: "calls:unfavorite",
				msg: error
			}, 'self');
		} else {
			cb("calls:update", updated);
		}
	});
};
exports['calls:delete'] = function(operator_id, data, cb) {
	userApi.callsDelete(data, function(error, deleted) {
		if (error) {
			cb("event_error", {
				event: "calls:delete",
				msg: error
			}, 'self');
		} else {
			let deletedCalls = {};
			data.map(id => {
				deletedCalls[id] = null;
			});
			cb("calls:update", deletedCalls);
		}
	});
};
exports['calls:play'] = function(operator_id, data, cb) {
	console.error('Play calls on air!');
};
