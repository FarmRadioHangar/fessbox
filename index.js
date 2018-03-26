console.error("==========================++++++++++++++============================");
var logger = new (require("./logger"))(__filename, false);
var appConfig = require("./etc/app.json");
var s = require("./localStorage");
var ami = require("./ami");

var args = process.argv.slice(2);
if (args.indexOf("defaults") !== -1) {
	s.deleteSavedSettings();
}
/*
} else if (args.indexOf("snapshot") !== -1) {
	s.loadSnapshot();
}
*/
//websocket.startLogListener({ port: appConfig.wsLogsPort });

ami.on("initialized", function () {
	require("./websocket").init({
		port: appConfig.wsPort,
		allowOrigin: appConfig.allowOrigin,
		clientVersion: require("./package").clientVersion,
		//validOperators: validOperators,
	}, () => {
		logger.notice("FessBox WebSocket Server has started on port", appConfig.wsPort);

		// exceptions during startup of essential services should be fatal
		process.on('uncaughtException', function (err) {
			logger.error("uncaughtException", err.stack);
		});

		process.on("SIGHUP", function () {
			logger.notice("SIGHUP received:", "config reload");
		});

		process.on("SIGUSR1", function () {
			logger.notice("SIGUSR1 received:", "scheduled maintenance");
		});

		process.on("SIGTERM", function () {
			logger.notice("SIGTERM received:", "exiting process");
			s.saveSnapshot(process.exit);
		});
		require("./restServer");
	});
});
