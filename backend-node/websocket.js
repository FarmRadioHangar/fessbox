var url = require("url");

var s = require("./localStorage");
var appConfig = require("./config/app.json");
var eventHandlers = require("./eventHandlers");
var myLib = require("./myLib");

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: appConfig.wsPort });

wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true);

	ws.on('message', function incoming(message) {
		message = JSON.parse(message);
		if (!message.event) {
			ws.send(serializeObject("input_error", "message format error, should be { event: String, data: Object }"));
		} else {
			// debug: return to sender and print
			ws.send(serializeObject("echo", message));
			console.log('received %s: %s', message.event, JSON.stringify(message.data));

			if (!eventHandlers[message.event]) {
				myLib.consoleLog('debug', 'returned', "event handler not found");
				ws.send(serializeObject("input_error", "event handler not found"));
			} else {
				eventHandlers[message.event](location.query.user_id, message.data, function (event, data, target) {
					data = serializeObject(event, data);
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
	if (location.query.user_id && s.ui.users[location.query.user_id]) { 
		var users = {};
		users[location.query.user_id] = s.ui.users[location.query.user_id];
	}
	var initState = {
		mixer: s.ui.mixer,
		users: users,
		server_time: Date.now()
	};
	ws.send(serializeObject("initialize", initState));
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

var serializeObject = function (event, data) {
	return JSON.stringify({
		event: event,
		data: data
	});
};

var broadcastEvent = function (event, data) {
	var payload = serializeObject(event, data);
	myLib.consoleLog('debug', 'broadcastEvent', payload);
	wss.clients.forEach(function each(client) {
		client.send(payload);
	});
};

exports.broadcastEvent = broadcastEvent;
//exports.bind = bind;
