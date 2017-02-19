var emailjs = require("emailjs");
var mailConfig = require("./config/email.json");

function mailSend(subject, body, addressTo) {
	var server = emailjs.server.connect({
		user:    mailConfig.username,
		password: mailConfig.password,
		host:    mailConfig.smtpHost,
		ssl:     true
	});
	// send the message and get a callback with an error or details of the message that was sent
	server.send({
		text:    body,
		from:    mailConfig.username,
		to:      addressTo,
		subject: subject
	}, function(err, message) {
		if (err) {
			console.error('ERROR::mailSend - ' + JSON.stringify(err));
		}
	});
}

function httpGeneric(statusCode, message, response, label) {
	if (!response) {
		statusCode = statusCode + " <no-http-response>";
	} else {
		if (statusCode === 200) {
			if (!message) {
				message = '{}';
			} else if (label !== false && !label) {
				label = "OK";
			}
			response.setHeader("Content-Type", "text/json");
		} else {
			response.setHeader("Content-Type", "text/plain");
		}
		response.writeHead(statusCode);
		response.end(message);
	}
	if (label) {
		console.error(label + " - [" + statusCode + "] " + message);
	}
}

function consoleLog(level, label, message, values) {
	var logStamp = '>>>> ' + new Date().toLocaleString() + " -";
/*
	if (!label) {
		//arguments.callee.name
		//arguments.callee.caller.name
		label = consoleLog.caller;
	}
*/
	label += ":";
	if (values !== null && typeof (values) === 'object') {
		values = JSON.stringify(values, null, 4);
	}
	if (level === "error" || level === "log") {
		//console[level](logStamp, level, label, message, values);
		console.error(logStamp, level, label, message, values);
	} else if (level === 'warning') {
		//console.log(logStamp, level, label, message, values);
		console.error(logStamp, level, label, message, values);
	} else if (level === 'debug') {
		console.error('||||', Date.now(), level, label, message, values);
	} else {
		console.error(logStamp, "undefined log level: " + level, label, message, values);
	}
}

function jsonLog(metadata, labels, tags, values, extra) {
	// temp handling of old log
	if (typeof metadata === 'string') {
		var temp = message;
		[].unshift.call(arguments, {});
		values  = temp;
	}
	if (typeof labels  === 'string') {
		labels = [labels];
	}

	var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
	var timestamp = Date.now();
	var localISOTime = (new Date(timestamp - tzoffset)).toISOString();
	var debugEntry = JSON.stringify({
		logStamp: localISOTime.slice(0, -1),
		timestamp: timestamp,
		metadata: metadata,
		labels: labels,
		tags: tags,
		values: values,
		extra: extra
	});
	//websocket.emitDebugEvent(debugEntry);
	console.log(debugEntry);

	if (values !== null && typeof (values) === 'object') {
		values = JSON.stringify(values, null, 4);
	}
	if (extra !== null && typeof (extra) === 'object') {
		extra = JSON.stringify(extra, null, 4);
	}

	var errorLabels = ["warning", "error", "panic", "alert"];
	labels.forEach(function (label){
		if (errorLabels.indexOf(label) !== -1) {
			console.error(">>>>", debugEntry.logStamp, labels, tags, values, metadata, extra);
		}
	});
}

exports.checkObjectProperties = function (params, required) {
	if (typeof(params) !== 'object') {
		throw Error('First param must be an object');
	} else if (!params) {
		return false;
	} else {
		if (!required) {
			return true;
		} else if (Array.isArray(required)) {
			for (var i in required) {
				if (!params[required[i]]) {
					return false;
				}
			}
			return true;
		} else {
			throw Error('Second param must be an array');
		}
	}
};

exports.httpGeneric = httpGeneric;
exports.mailSend = mailSend;
exports.jsonLog = jsonLog;
exports.consoleLog = consoleLog;
exports.msecDuration = function(hms) {
	// expects HH:MM:SS
	var a = hms.split(':'); // split it at the colons
	return ((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])) * 1000; 
};
