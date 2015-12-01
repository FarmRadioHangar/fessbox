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

function consoleLog(output, label, message) {
	var logStamp = new Date().toLocaleString() + " -";
/*
	if (!label) {
		//arguments.callee.name
		//arguments.callee.caller.name
		label = consoleLog.caller;
	}
*/
	label += ":";
	if (output === "error" || output === "log") {
		console[output](logStamp, output, label, message);
	} else if (output === 'warning') {
		console.log(output, label, message);
	} else if (output === 'debug') {
		console.error(output, label, message);
	} else {
		console.error(logStamp, "undefined log output", label, message);
	}
}

exports.checkRequiredParams = function (required, params) {
	for (var i in required) {
		if (!params[required[i]]) {
			return false;
		}
	}
	return true;
};

exports.httpGeneric = httpGeneric;
exports.mailSend = mailSend;
exports.consoleLog = consoleLog;
