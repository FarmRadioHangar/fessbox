var path = require('path');
var myLib = require('./myLib');
var appConfig = require("./etc/app.json");
var production = process.env.NODE_ENV === 'production';

var logstamp = function(timestamp) {
	let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
	let localISOTime = (new Date(timestamp - tzoffset)).toISOString();
	return localISOTime.slice(0, -1).replace('T', ' ');
};

console.error(logstamp(Date.now()), '*', production ? "PRODUCTION" : "DEVELOPMENT", "ENV * node", process.version, "initialized with pid", process.pid, "in", __dirname);

module.exports = function (filename, debugEnabled) {
	if (typeof debugEnabled !== 'boolean') {
		debugEnabled = !production;
	}
	var scriptName = path.basename(filename) + ":";

/*	Disabled not to interfere with json output
	var info = function (title, ...data) {
		console.log("···", logstamp(Date.now()), debugEnabled ? scriptName : 'INFO', title, ...data);
	};
	this.info = info; */

	var notice = function (title, ...data) {
		console.error("···", logstamp(Date.now()), debugEnabled ? 'NOTICE' : '*', scriptName, title, ...data);
	};
	this.notice = notice;

	var debug = function (title, ...data) {
		console.error("***", logstamp(Date.now()), 'DEBUG', scriptName, title, ...data);
		return true;
	};
	this.debug = debugEnabled ? debug : () => false;

	var email = function (title, ...data) {
		if (debugEnabled) {
			debug("send-email", [title, ...data]);
		}
		let body = [...data].map((item) => {
			if (item) {
				return typeof item === 'object' ? JSON.stringify(item, null, 4) : item.toString();
			} else {
				return '';
			}
		});
		myLib.mailSend([__dirname, scriptName].join('/') + [' ', title, logstamp(Date.now())].join(' '), body.join("\n"), appConfig.adminEmail);
	};
	this.email = email;

	var error = function (title, ...data) {
		if (!debugEnabled) {
			email(title, ...data);
		}
		console.error('!!!', logstamp(Date.now()), 'ERROR', scriptName, title, ...data);
	};
	this.error = error;

	var warning = function (title, ...data) {
		console.error('---', logstamp(Date.now()), 'WARNING', scriptName, title, ...data);
	};
	this.warning = warning;

	this.getNanoseconds = function () {
		let hrtime = process.hrtime();
		return hrtime[0] * 1000000000 + hrtime[1];
	};

	function jsonLog(metadata, labels, tags, values, extra) {
		if (typeof labels  === 'string') {
			labels = [labels];
		}

		let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
		let timestamp = Date.now();
		let localISOTime = (new Date(timestamp - tzoffset)).toISOString();
		let debugEntry = JSON.stringify({
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
/*
		if (values !== null && typeof (values) === 'object') {
			values = JSON.stringify(values, null, 4);
		}
		if (extra !== null && typeof (extra) === 'object') {
			extra = JSON.stringify(extra, null, 4);
		}

		let errorLabels = ["warning", "error", "panic", "alert"];
		labels.forEach(function (label){
			if (errorLabels.indexOf(label) !== -1) {
				console.error(">>>>", debugEntry.logStamp, labels, tags, values, metadata, extra);
			}
		});
*/
	}
	this.json = jsonLog;
};
