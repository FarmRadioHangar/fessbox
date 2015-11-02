var ami = require("./ami");
var myLib = require("./myLib");

exports.connectNumbers = function (response, params) {
	var result = ami.connectNumbers(params.number1, params.number2);
	myLib.httpGeneric(200, result, response, "DEBUG::connectNumbers");
}

exports.setChannelVolume = function (response, params) {
	var result = ami.setChannelVolume(params.channel, params.level, params.direction);
	myLib.httpGeneric(200, result, response, "DEBUG::setChannelVolume");
}
