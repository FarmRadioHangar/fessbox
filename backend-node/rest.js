
var myLib = require("./myLib");
var api = require("./api");
var ami = require("./ami");
var s = require("./singleton");

/*
exports.connectNumbers = function (response, params) {
	var result = ami.connectNumbers(params.number1, params.number2);
	myLib.httpGeneric(200, result, response, "DEBUG::connectNumbers");
};
*/

exports.setChannelVolume = function (response, params) {
	var result = ami.setChannelVolume(params.channel, params.level);
	myLib.httpGeneric(200, result, response, "DEBUG::setChannelVolume");
};


