console.log("==========================++++++++++++++============================");
var myLib = require("./myLib");
var appConfig = require("./config/app.json");
var s = require("./localStorage");
var ami = require("./ami");
var wss = require("./websocket");

var args = process.argv.slice(2);
if (args.indexOf("defaults") !== -1) {
	s.deleteSavedSettings();
}
/*
} else if (args.indexOf("snapshot") !== -1) {
	s.loadSnapshot();
}
*/

ami.on("initialized", function () {
	wss.startListening({ port: appConfig.wsPort });
	console.log(new Date().toLocaleString() + " - FessBox Node Server has started!");
});

process.on("SIGTERM", function () {
	console.log("SIGTERM received");
	s.saveSnapshot(process.exit);
});

process.on('uncaughtException', function (err) {
	console.error("EXCEPTION::" + err.stack);
	//myLib.mailSend('uncaughtException on ' + new Date().toLocaleString(), err.stack, appConfig.adminEmail);
});

/*
start web server, for debuging rest interface
*/
var http = require("http");
var apiHandler = require("./rest");
var router = require("./router");

function startAPI(route, apiHandler) {
	function onApiRequest(request, response) {
		route(apiHandler, request, response, true);
	}
	http.createServer(onApiRequest).listen(19990).setTimeout(55000);
}

startAPI(router.route, apiHandler);
/*
end debug code
*/


