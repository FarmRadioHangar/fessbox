exports.createChannel = function (type, label) {
	return {
		type       : type,
		level      : 67,
		direction  : null,
		label      : label,
		mode       : 'defunct',
		muted      : false,
		timestamp  : null,
		autoanswer : null,
		contact    : null,
		recording  : false
	};
};
