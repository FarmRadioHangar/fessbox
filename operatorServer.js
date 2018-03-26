"use strict";
var logger = new (require("./logger"))(__filename);
var url = require("url");
var semver = require("semver");
var WebSocket = require('ws');

/*additional options: {
	pongTimeout: (number), // timeout before assuming connection failed, in ms
	validOperators: (Map), // [operator_id, name]
	clientVersion: (string), // minimal compatible client version
}*/
class OperatorServer extends WebSocket.Server {
	constructor(options, callback) {
		options = Object.assign({
			pongTimeout: 1000, // timeout before assuming connection failed
		}, options);

		super(options, () => callback.bind(this)());
		this.operators = new Map(); // [operator_id, ws]

		this.on('connection', (ws, req) => { // valid operator is in req.operator_id
			let remoteIp = req.headers['x-forwarded-for'] || req.headers["x-real-ip"] || req.connection.remoteAddress;
			let location = url.parse(req.url, true);
			let clientSignature = {
				//id: req.operator_id,
				url: req.url,
				ip: remoteIp,
				"user-agent": req.headers["user-agent"],
			};
			logger.debug('WebSocket established', clientSignature);
			ws.sendEvent = (eventName, data, cb) => ws.send(this.serializeEvent(eventName, data), cb);

			//todo: do not allow request without version if options.clientVersion is specified (in `production` env)
			if (location.query.v && semver.valid(this.options.clientVersion) && semver.lt(location.query.v, this.options.clientVersion)) {
				let err = ["incompatible version:", location.query.v, "<", this.options.clientVersion].join(' ');
				logger.warning("Client connection reset", err, clientSignature);
				ws.sendEvent('client:reload', this.options.clientVersion);
				ws.close(1011, err);
				return;
			}

			let login = () => {
				//logger.info("Client login", clientSignature);

				if (req.operator_id) {
					ws.on('close', () => {
						// connection in operators Map could already be replaced
						if (this.operators.get(req.operator_id) === ws) {
							this.operators.delete(req.operator_id);
						}
					});
					this.operators.set(req.operator_id, ws);
				} else { // for better debug-log
					req.operator_id = '';
				}

				ws.on('message', function parse(data) {
					/*
					let message = false;
					try {
						message = JSON.parse(data);
					} catch (e) {
						let exception = {
							info: 'JSON.parse error',
							msg: e.name + ": " + e.message,
							data: data
						};
						logger.error('invalid incoming message', exception);
						this.sendEvent('client:error', exception);
					}
					*/
					let message = JSON.parse(data);

					if (!message.event) {
						let exception = {
							info: 'message format error', // should be { event: String, data: Object }
							msg: "'event' field is missing",
							data: data
						};
						logger.error("invalid incoming message", exception, clientSignature);
						this.sendEvent("client:error", exception);
					} else {
						let silentEvents = ["ping"];
						if (!silentEvents.includes(message.event)) {
							logger.debug("ws-in <<<<==", req.operator_id, message.event, message.data, remoteIp);
						}
						if (message.event === 'pong' && this.pingSent && this.pingSent === message.data) {
							this.emit('alive', message.data);
						} else {
							this.emit('event', message.event, message.data);
						}
					}
				});

				this.emit('client:init', ws, req.operator_id, { clientInfo: clientSignature });
			};

			if (!req.operator_id) {
				login();
			} else {
				// check if operator_id is not already connected
				if (!this.operators.has(req.operator_id)) {
					login();
				} else {
					let ws_client = this.operators.get(req.operator_id);
					logger.debug("Operator login" , "Active socket detected", remoteIp, location.pathname, location.query, req.headers["user-agent"]);
					if (ws_client.readyState !== WebSocket.OPEN) {
						login();
					} else if (ws_client.pingSent) {
						let err = "testing active socket in progress";
						logger.warning('Client connection', err, req.operator_id);
						ws.sendEvent("server:error", {
							event: "client:init",
							data: req.url,
							msg: err,
						});
						ws.close(1013, err);
					} else { //if (ws_client.readyState === WebSocket.OPEN) {
						ws_client.testing = setTimeout(() => {
							let err = "active socket testing failed";
							logger.debug('Client connection', err, req.operator_id);
							if (ws_client && ws_client.readyState === WebSocket.OPEN) {
								ws_client.terminate();
							}
							if (ws && ws.readyState === WebSocket.OPEN) {
								login();
							}
						}, this.options.pongTimeout);
						ws_client.once("alive", function() {
							clearTimeout(this.testing);
							let err = "This operator is already connected";
							let latency = Date.now() - this.pingSent;
							logger.warning('Client connection failed', err, req.operator_id, latency);
							this.pingSent = null;
							ws.close(1008, err);
						});
						ws_client.pingSent = Date.now();
						ws_client.sendEvent("ping", ws_client.pingSent);
					}
				}
			}

			ws.on('close', (code, reason) => {
				if (code === 3000) {
					logger.warning("Client force disconnected", code, reason, clientSignature);
				} else {
				// only if not logged in
				//if (req.operator_id !== '' && (!req.operator_id || this.operators.get(req.operator_id) !== ws)) {
					logger.debug("WebSocked disconnected", code, reason, remoteIp, location.pathname, location.query, req.headers["user-agent"]);
				}
			});

			ws.on('error', function(err) {
				logger.error("websocket-error", err, clientSignature);
			});
		});
	}

	// operator_id: if specified, exclude from broadcast
	_broadcast (data, operator_id) {
		let exclude = operator_id ? this.operators.get(operator_id) : null;
		let count = 0;
		this.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN && client !== exclude) {
				client.send(data);
				count++;
			}
		});
		return count;
	}

	_unicast (operator_id, data, cb) {
		let client = this.operators.get(operator_id);
		if (client && client.readyState === WebSocket.OPEN) {
			client.send(data, cb);
			return true;
		}
	}

	serializeEvent (eventName, data) {
		// maybe should be optimized as { eventName: data }
		return JSON.stringify({
			event: eventName,
			data: data
		}, null, 4);
	}

	broadcastEvent (eventName, data, operator_id, excludeSelf) {
		let payload = this.serializeEvent(eventName, data);
		let reach = this._broadcast(payload, excludeSelf ? operator_id : null);
		logger.debug("ws-out ==>>>>", operator_id ? operator_id : 'system', excludeSelf ? 'multicast to' : 'broadcast to', reach, eventName, data);
		return reach;
	}

	unicastEvent (operator_id, eventName, data, cb) {
		let payload = this.serializeEvent(eventName, data);
		if (this._unicast(operator_id, payload, cb)) {
			logger.debug("ws-out ==>>>>", 'unicast to', operator_id, eventName, data);
			return true;
		} else {
			logger.warning("Unicast to operator failed", operator_id, eventName, data);
		}
	}

	connectedOperators () {
		return Array.from(this.operators.keys());
	}

	set validOperators (operators) {
		this.options.validOperators = operators;
	}
}

WebSocket.OperatorServer = OperatorServer;
module.exports = WebSocket;

