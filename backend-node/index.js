console.log("==========================++++++++++++++============================");

var appConfig = require("./config/app.json");
var s = require("./localStorage");
s.loadSnapshot();

var ami = require("./ami");
var myLib = require("./myLib");

/*
var http = require("http");
var apiHandler = require("./rest");
var router = require("./router");

function startAPI(route, apiHandler) {
	function onApiRequest(request, response) {
		route(apiHandler, request, response, true);
	}
	http.createServer(onApiRequest).listen(19990).setTimeout(25000);
}

startAPI(router.route, apiHandler);
*/
process.on("SIGTERM", function () {
	console.log("SIGTERM received");
	s.saveSnapshot(process.exit);
});

process.on('uncaughtException', function (err) {
	console.error("EXCEPTION::" + err.stack);
	//myLib.mailSend('uncaughtException on ' + new Date().toLocaleString(), err.stack, appConfig.adminEmail);
});

console.log(new Date().toLocaleString() + " - FessBox Node Server has started!");
