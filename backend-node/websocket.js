var appConfig = require("./config/app.json");

var api = require("./api");
var eventHandlers = require("./eventHandlers");
var myLib = require("./myLib");

var url = require("url");
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: appConfig.wsPort });

wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true);

	ws.on('message', function incoming(message) {
		myLib.consoleLog('debug', 'receivedEvent', message);
		message = JSON.parse(message);
		if (!message.event) {
			ws.send(serializeEvent("input_error", "message format error, should be { event: String, data: Object }"));
		} else {
			// debug: return to sender and print
			ws.send(serializeEvent("echo", message));

			if (!eventHandlers[message.event]) {
				myLib.consoleLog('debug', 'input_error', "event handler not found: " + message.event);
				ws.send(serializeEvent("input_error", "event handler not found: " + message.event));
			} else {
				eventHandlers[message.event](location.query.user_id, message.data, function (event, data, target) {
					data = serializeEvent(event, data);
					myLib.consoleLog('debug', 'emitEvent', data);
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

	api.getCurrentState(location.query.user_id, function (err, initState) {
		ws.send(serializeEvent("initialize", initState));
	});
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

var serializeEvent = function (event, data) {
	// maybe can be optimized as { eventName: data } ?
	return JSON.stringify({
		event: event,
		data: data
	});
};

var broadcastEvent = function (event, data) {
	var payload = serializeEvent(event, data);
	myLib.consoleLog('debug', 'broadcastEvent', payload);
	wss.clients.forEach(function each(client) {
		client.send(payload);
	});
};

exports.broadcastEvent = broadcastEvent;
