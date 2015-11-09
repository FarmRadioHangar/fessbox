var net = require("net");
var http = require("http");
var fs = require("fs");
var readline = require("readline");

var wss = require("./websocket");
var apiHandler = require("./api");
var router = require("./router");
var myLib = requuire("./myLib");

//https://github.com/websockets/ws
//var WebSocket = require('ws');

/*
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 19998 });

var sms_buffer = [];

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  for (var i in sms_buffer) {
        ws.send(sms_buffer[i]);
  }
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
*/

function readInput() {
/*
        var answered_calls = readline.createInterface({
                input: fs.createReadStream(__dirname + "/pipes/answered_calls"),
                output: fs.createWriteStream(__dirname + "/pipes/answered_calls"),
                terminal: false
        });

        answered_calls.on('line', function(line){
//              console.log("input: " + line);
                if (sms_buffer.length >= 50) {
                        sms_buffer.shift();
                }
                var line = '{"type":"call","num":"' + line + '"}';
                sms_buffer.push(line);

                wss.broadcast(line);
        });
        // this is not needed actualy
        answered_calls.on('close', function() {
                console.log("CLOSED :(");
                readInput();    
        });
*/
        var pbx_sms = readline.createInterface({
                input: fs.createReadStream(__dirname + "/pipes/pbx_sms"),
                output: fs.createWriteStream(__dirname + "/pipes/pbx_sms"),
                terminal: false
        });

        pbx_sms.on('line', function(line){
//              console.log("INPUT: " + line);

                if (sms_buffer.length >= 50) {
                        sms_buffer.shift();
                }

                var line = {
                        type: "sms",
                        text: line.replace(/<br\/>/g,' ⋮ ')
                };
                sms_buffer.push(line);
                
                wss.broadcast(JSON.stringify(line));
        });
        
}
readInput();

function startAPI(route, apiHandler) {
        function onApiRequest(request, response) {
                route(apiHandler, request, response, true);
        }
        http.createServer(onApiRequest).listen(19990).setTimeout(25000);
}

startAPI(router.route, apiHandler);

process.on("SIGTERM", function () {
        console.log("SIGTERM received");
        s.saveSnapshot(process.exit);
      process.exit();
});

process.on('uncaughtException', function (err) {
        console.error("EXCEPTION::" + err.stack);
        myLib.mail2admin('uncaughtException on ' + new Date().toLocaleString(), err.stack);
});

s.loadSnapshot();

console.log("==============================================");
console.log(new Date().toLocaleString()) + " - FessBox Node Server has started!");
