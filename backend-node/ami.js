var config = require("./config/ami.json");
var s = require("./singleton");
// npm install asterisk-manager
var ami = new require('asterisk-manager')(config.port, config.host, config.username, config.password, true);
//https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events
//https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Actions
ami.keepConnected();

ami.on('fullybooted', function(evt) {
	console.log(new Date().toLocaleString(), " - connected to asterisk!");
	s.ui.mixer = {};
});

ami.on('managerevent', function(evt) {
//	console.error(JSON.stringify(evt));
});

//{"event":"Newchannel","privilege":"call,all","channel":"SIP/703-00000000","channelstate":"0","channelstatedesc":"Down","calleridnum":"703","calleridname":"Damjan Laptop","accountcode":"","exten":"2663","context":"from-internal","uniqueid":"1445360462.0"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-input","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.1"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-output","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.2"}
//
ami.on('newchannel', function(evt) {
	console.log(JSON.stringify(evt));
	if (evt.channel.indexOf("Dongle") === 0) {
		s.channels[evt.calleridname] = evt;
	} else if (evt.calleridnum) {
		s.channels[evt.calleridnum] = evt;
	}
});

// {"event":"ConfbridgeJoin","privilege":"call,all","channel":"SIP/703-00000000","uniqueid":"1444910756.0","conference":"2663","calleridnum":"703","calleridname":"Damjan Laptop"}
ami.on('confbridgejoin', function(evt) {
	console.log(JSON.stringify(evt));
	mainConference[evt.calleridnum] = {
		calleridname: evt.calleridname,
		channel: evt.channel,
		levelTX: null,
		levelRX: null
	};
});

// helper functions

function setVar(channel, variable, value) {
	ami.action({
		action: 'Setvar',
		channel: channel,
		variable: variable,
		value: value
	}, function(err, res) {
		if (!err) {
			console.log(JSON.stringify(res));
		} else {
			console.log(err.toString());
		}
	});
}

function getVar(channel, variable, cb) {
	ami.action({
		action: 'Getvar',
		channel: channel,
		variable: variable
	}, function(err, res) {
		if (!err) {
			cb(res.value);
			console.log(JSON.stringify(res));
		} else {
			console.log(err.toString());
		}
	});
}


function connectNumbers(number1, number2) {
//var number1 = "0687754487";
//var number2 = "0786082881";

	var channel = "Local/" + number1 + "@from-internal/n";
	var context = "from-internal"; // confbridge should be here
	var timeout = 29000;

	ami.action({
		'action':'originate',
		'channel': channel,
		'context': context,
		'exten': number2,
		'priority': 1,
		'timeout': timeout,
		'variable':{
		}
	}, function(err, res) {
		if (!err) {
			console.log(JSON.stringify(res));
		} else {
			console.log(err.toString());
		}
	});
}

function setChannelVolume(channel, level, direction) {
	
	var variable = 'VOLUME(' + direction + ')';
	ami.action({
		action: 'Setvar',
		channel: channel,
		variable: variable,
		value: level
	}, function(err, res) {
		if (!err) {
			console.log(JSON.stringify(res));
		} else {
			console.error(err.toString());
		}
	});
}

exports.connectNumbers = connectNumbers;
exports.setChannelVolume = setChannelVolume;
