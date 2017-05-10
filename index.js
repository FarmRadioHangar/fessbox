console.error("==========================++++++++++++++============================");
var myLib = require("./myLib");
var appConfig = require("./etc/app.json");
var s = require("./localStorage");
var ami = require("./ami");
var websocket = require("./websocket");

var args = process.argv.slice(2);
if (args.indexOf("defaults") !== -1) {
	s.deleteSavedSettings();
}
/*
} else if (args.indexOf("snapshot") !== -1) {
	s.loadSnapshot();
}
*/
websocket.startLogListener({ port: appConfig.wsLogsPort });

ami.on("initialized", function () {
	require("./restServer");
	websocket.startListening({ port: appConfig.wsPort });
	console.error(new Date().toLocaleString() + " - FessBox Node Server has started!");
});

process.on("SIGHUP", function () {
	myLib.consoleLog("debug", "=========", "SIGHUP received", "=========");
	console.error("SIGHUP received, config reload");
});

process.on("SIGUSR1", function () {
	myLib.consoleLog("debug", "=========", "SIGUSR1 received", "=========");
	console.error("SIGUSR1 received, scheduled maintenance");
});

process.on("SIGTERM", function () {
	console.error("SIGTERM received");
	s.saveSnapshot(process.exit);
});

process.on('uncaughtException', function (err) {
	console.error("EXCEPTION::" + err.stack);
    myLib.consoleLog("error", "uncaughtException", err.stack, err);
//    myLib.mailSend('uncaughtException on ' + new Date().toLocaleString(), err.stack, appConfig.adminEmail);
});


/*
start web server, for debuging rest interface

var http = require("http");
var apiHandler = require("./rest");
var router = require("./router");

function startAPI(route, apiHandler) {
	function onApiRequest(request, response) {
		route(apiHandler, request, response, true);
	}
	http.createServer(onApiRequest).listen(appConfig.restPort).setTimeout(55000);
}

startAPI(router.route, apiHandler);

end debug code
*/


