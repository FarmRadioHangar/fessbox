var s = require("./singleton");
var api = require("./api");
var myLib = require("./myLib");
var eventHandlers = require("./eventHandlers");

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 19998 });

wss.on('connection', function connection(ws) {
	var fromUrl = ws.upgradeReq.url.substr(1);
	ws.on('message', function incoming(message) {
		message = JSON.parse(message);
		if (!message.event) {
			ws.send(serializeObject("input_error", "message format error, should be { event: String, data: Object }"));
		} else {
			// debug: return to sender
			ws.send(serializeObject("echo", message));
			console.log('received %s: %s', message.event, JSON.stringify(message.data));
			if (!eventHandlers[message.event]) {
				myLib.consoleLog('debug', 'returned', err);
				ws.send(serializeObject("input_error", "event handler not found"));
			} else {
				eventHandlers[message.event](message.data, function (event, data, target) {
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
	ws.send(serializeObject("initialize", s.ui));
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

var broadcast = function (event, data) {
	var payload = serializeObject(event, data);
	wss.clients.forEach(function each(client) {
		client.send(payload);
	});
};


exports.broadcast = broadcast;
//exports.bind = bind;
