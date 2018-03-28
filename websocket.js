var logger = new (require("./logger"))(__filename);
var url = require("url");
var WebSocket = require('./operatorServer');

var wss;
var eventHandlers = {
	pong: () => null,
	noop: () => null,
	ping: function (operator_id, data, cb) {
		cb("pong", data, 'self');
	},
	//debug
	echo: function (operator_id, data, cb) {
		cb(data.event, data.data, 'self');
	},
};

exports.connectedOperators = (...args) => {
	if (wss && wss.connectedOperators) return wss.connectedOperators(...args);
	else logger.warning("Operator Server not initialized"); //temp
};
exports.unicastEvent = (...args) => {
	if (wss && wss.unicastEvent) return wss.unicastEvent(...args);
	else logger.warning("Operator Server not initialized"); //temp
};
exports.broadcastEvent = (...args) => {
	if (wss && wss.broadcastEvent) return wss.broadcastEvent(...args);
	else logger.warning("Operator Server not initialized"); //temp
};

/*additional options: {
	allowOrigin: (string), // allow connections only from this origin
}*/
exports.init = (options, callback) => {
	if (wss) { //temp
		logger.warning("Operator Server already initialized");
		callback("Operator Server already initialized");
		return;
	}
/*
	// executed during handshake, before upgrade to websocket
	// on error, code and message not visible to browser js (only generic 1006)
	// on success, 'operator_id' is added to the request object (info.req)
	function verifyClient (info, cb) { // cb(verified, code, message)
		//logger.debug('verifyClient');
		let logTitle = "Verify dispatcher client";
		let remoteIp = info.req.headers['x-forwarded-for'] || info.req.headers["x-real-ip"] || info.req.connection.remoteAddress;
		if (this.allowOrigin && this.allowOrigin !== info.origin) {
			let err = "unknown origin";
			cb(false, 406, err);
			logger.warning(logTitle, err, remoteIp, info.req.url, info.req.headers["user-agent"]);
		} else {
			let location = url.parse(info.req.url, true);
			if (!location.query.operator_id) {
				cb(true);
			} else {
				let operator_id = parseInt(location.query.operator_id);
				// disallow < 1 (rezerved for system use)
				if (isNaN(operator_id) || operator_id < 1) {
					let err = "invalid operator_id";
					cb(false, 400, err);
					logger.error(logTitle, err, remoteIp, location.pathname, location.query, info.req.headers["user-agent"]);
				} else if (!eventHandlers.access.checkOperator(operator_id)) {
					let err = "unauthorized";
					cb(false, 401, err);
					logger.error(logTitle, err, remoteIp, location.pathname, location.query, info.req.headers["user-agent"]);
				} else {
					info.req.operator_id = operator_id;
					cb(true);
				}
			}
		}
	}
*/
	// load eventHandlers after ws server is instantiated
	function cb() {
		callback();
		setTimeout(() => Object.assign(eventHandlers, require("./eventHandlers")), 0);
	}

	wss = new WebSocket.OperatorServer(Object.assign({
		pongTimeout: 1500,
		//verifyClient,
	}, options), cb);

	wss.on('client:init', function login(ws, operator_id, options) {
		let operator = operator_id ? "Operator " + operator_id : "Anonymous";
		if (operator_id && this.options.validOperators) {
			operator += ": " + this.options.validOperators.get(operator_id);
		}
		logger.notice(operator, "connected, total:", this.clients.size);

		let eventCallback = (name, data, target) => {
			switch (target) {
				case 'self':
					if (ws.readyState === WebSocket.OPEN) {
						let silentEvents = ["pong", "call:list", "contact:info", "initialize", "inboxMessages"];
						if (!silentEvents.includes(name)) {
							logger.debug("ws-out ==>>>>", operator_id, name, data);
						}
						ws.sendEvent(name, data);
					}
					break;
				case 'others':
				default: // if target not specified, broadcast to all
					this.broadcastEvent(name, data, operator_id ? operator_id : ws, target);
			}
		};

		eventHandlers.initialize(operator_id, options, eventCallback);

		logger.json(options.clientInfo, ["telegraf", "debug"], ["websocket"], { websocket: {
			count: wss.clients.length,
			value: 1
		}}, "connected");

		ws.on('close', function(code, reason) {
			logger.notice(operator, "disconnected", code, reason);

			logger.json(options.clientInfo, ["telegraf", "debug"], ["websocket"], { websocket: {
					count: wss.clients.length,
					value: 0
			}}, "disconnected");

			if (operator_id) {
				//eventHandlers['client:exit'](operator_id, null, eventCallback);
			}
		});

		ws.on('event', function (name, data) {
			/*var eventCallback = function (event, data, target) {
				if (target === 'error') {
					target = 'self';
					data = Object.assign(message, {msg: data});
				}
				eventDispatcher(event, data, target);
			};*/
			try { // temp
				if (typeof eventHandlers[name] === 'function') {
					eventHandlers[name](operator_id, data, eventCallback, name);
				} else {
					let module, action;
					[module, action] = name.split(':', 2);
					if (action && eventHandlers[module] && typeof eventHandlers[module][action] === 'function') {
						eventHandlers[module][action](operator_id, data, eventCallback, action);
					} else {
						let err = "unknown event";
						logger.debug("websocket-in", operator_id, err, name, data);
						ws.sendEvent("client:error", {
							event: name,
							data: data,
							msg: err,
						});
					}
				}
			} catch (e) {
				logger.error("websocket-in", "unhandled eventHandler exception", name, data, e);
				logger.email("unhandled eventHandler exception", name, data, e);
			}
		});
	});

	return module.exports;
};
