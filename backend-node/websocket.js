var s = require("./singleton");
var ami = require("./ami");
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 19998 });

wss.on('connection', function connection(ws) {
	var fromUrl = ws.upgradeReq.url.substr(1);
	ws.on('message', function incoming(message) {
		message = JSON.parse(message);
		if (!message.event) {
			ws.send(createObject("input_error", "message format error, should be { event: String, data: Object }"));
		} else {
			console.log('received %s: %s', message.event, JSON.stringify(message.data));
			console.log('s.channels', s.channels);
			if (message.data.tracks) {
				for (var i=0; i < message.data.tracks.length; i++) {
					var item = message.data.tracks[i];
					if (s.channels[item.name]) {
						// gain: 0 - 1.3225
						console.log('exp:', Math.exp(item.gain));
						var level = (item.gain - 0.65) * 25;
						console.log('!!!', s.channels[item.name].channel, level, "RX");
						ami.setChannelVolume(s.channels[item.name].channel, level, "TX");
						ami.setChannelVolume(s.channels[item.name].channel, level, "RX");
					}
				}
			}
		}
	});
	ws.send(createObject("initialize", s.ui));
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

var createObject = function (event, data) {
	return JSON.stringify({
		event: event,
		data: data
	});
};

var broadcast = function (event, data) {
	var payload = createObject(event, data);
	wss.clients.forEach(function each(client) {
		client.send(payload);
	});
};


exports.broadcast = broadcast;
//exports.bind = bind;
