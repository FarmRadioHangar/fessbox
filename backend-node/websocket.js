var eventHandlers = require("./eventHandlers");
var myLib = require("./myLib");

var url = require("url");

var WebSocketServer = require('ws').Server;

WebSocketServer.prototype.broadcast = function (data) {
	this.clients.forEach(function each(client) {
		client.send(data);
	});
};

var serializeEvent = function (event, data) {
	// maybe should be optimized as { eventName: data } ?
	return JSON.stringify({
		event: event,
		data: data
	});
};

var broadcastEvent = function (event, data) {
	if (!wss) {
		myLib.jsonLog({}, ['debug'], ['websocket'], 'wss not initialized', ['broadcast', event, data]);
	} else {
		var payload = serializeEvent(event, data);
		wss.broadcast(payload);
		//myLib.consoleLog('debug', 'websocket::broadcastEvent', payload);
		myLib.jsonLog({}, ['ws-out'], ['websocket'], payload, "broadcast");
	}
};
exports.broadcastEvent = broadcastEvent;

var wss;
exports.startListening = function(options) {
	if (!wss) {
		wss = new WebSocketServer(options);

		wss.on('connection', function connection(ws) {
			var location = url.parse(ws.upgradeReq.url, true);
			var remoteIp = ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.headers["x-real-ip"] || ws.upgradeReq.connection.remoteAddress;

			ws.on('message', function incoming(message) {
				//myLib.consoleLog('debug', 'websocket::receivedEvent', message);
				message = JSON.parse(message);
				if (!message.event) {
					ws.send(serializeEvent("input_error", "message format error, should be { event: String, data: Object }"));
				} else {
					// debug: return to sender and print
					ws.send(serializeEvent("echo", message));

					if (!eventHandlers[message.event]) {
						myLib.consoleLog('debug', 'websocket::input_error', "event handler not found", message);
						ws.send(serializeEvent("input_error", "event handler not found: " + message.event));
					} else {
						eventHandlers[message.event](location.query.user_id, message.data, function (event, data, target) {
							data = serializeEvent(event, data);
							myLib.consoleLog('debug', 'websocket::emitEvent', target, data);
							switch (target) {
								case 'self':
									ws.send(data);
									break;
								case 'others':
									wss.clients.forEach(function each(client) {
										if (client !== ws) {
											client.send(data);
										}
									});
									break;
								default:
									wss.broadcast(data);
							}
						});
					}
				}
			});

			eventHandlers.initialize(location.query.user_id, null, function (event, initState) {
				ws.on('close', function () {
					myLib.jsonLog({
						ip: remoteIp,
						url: ws.upgradeReq.url,
						"user-agent": ws.upgradeReq.headers["user-agent"]
					}, ["telegraf", "debug"], ["websocket"], { websocket: {
							count: wss.clients.length,
							value: 0
					}}, "disconnected");
				});
				ws.send(serializeEvent("initialize", initState));
				myLib.jsonLog({
					ip: remoteIp,
					url: ws.upgradeReq.url,
					"user-agent": ws.upgradeReq.headers["user-agent"]
				}, ["telegraf", "debug"], ["websocket"], { websocket: {
					count: wss.clients.length,
					value: 1
				}}, "connected");
				//myLib.consoleLog("debug", "websocket::on-connection", "initialize", initState);
			});
		});
	}
};

var logListener;
exports.startLogListener = function(options) {
	logListener = new WebSocketServer(options);
	logListener.on('connection', function connection(ws) {
		var location = url.parse(ws.upgradeReq.url, true);
		if (location.query.back) {
			var logPath = __dirname + "/log/debug.log";
			fs.readFile(logPath, function (err, data) {
				if (err) {
					console.error("log file read error: " + err.toString());
				} else {
					//create buffer to store events created while the backlog was sent to user
					ws.buf = [];
					var bufferString = data.toString();
					var lines = bufferString.split('\n');
					var offset = lines.length > location.query.back ? lines.length - location.query.back : 0;
					var limit = lines.length;
					if (location.query.count) {
						ws.silent = true;
						if (offset + location.query.count < lines.length) {
							limit = offset + location.query.count;
						}
					}
					for (var i = offset; i < limit; i++) {
						ws.send(lines[i]);
					}
					//myLib.consoleLog("alert", "displayed log entries from history", location.query.back, limit - offset);
					ws.buf.forEach(function(debugEntry) {
						ws.send(debugEntry);
					});
					ws.buf = null;
				}
			});
		}
	});
};

exports.emitDebugEvent = function(data) {
	if (logListener) {
		logListener.clients.forEach(function each(client) {
			if (!client.silent) {
				if (client.buf) {
					client.buf.push(data);
				} else {
					client.send(data);
				}
			}
		});
	}
};
