var eventHandlers = require("./eventHandlers");
var myLib = require("./myLib");

var url = require("url");

var WebSocketServer = require('ws').Server;
var wss;

var serializeEvent = function (event, data) {
	// maybe should be optimized as { eventName: data } ?
	return JSON.stringify({
		event: event,
		data: data
	});
};

var broadcastEvent = function (event, data) {
	if (wss) {
		var payload = serializeEvent(event, data);
		myLib.consoleLog('debug', 'websocket::broadcastEvent', payload);
		wss.clients.forEach(function each(client) {
			client.send(payload);
		});
	} else {
		myLib.consoleLog('debug', 'websocket::broadcastEvent', 'wss not initialized', serializeEvent(event, data));
	}
};

exports.broadcastEvent = broadcastEvent;
exports.startListening = function(options) {
	if (!wss) {
		wss = new WebSocketServer(options);

		wss.on('connection', function connection(ws) {
			var location = url.parse(ws.upgradeReq.url, true);

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
				ws.send(serializeEvent("initialize", initState));
				myLib.consoleLog("debug", "websocket::on-connection", "initialize", location.query);
				//myLib.consoleLog("debug", "websocket::on-connection", "initialize", initState);
			});
		});

		wss.broadcast = function broadcast(data) {
			wss.clients.forEach(function each(client) {
				client.send(data);
			});
		};
	}
};
