var i18n = require("i18n");

var amiConf = require("./config/ami.json");
var astConf = require("./config/asterisk.json");

var myLib = require("./myLib");
var s = require("./singleton");
var wss = require("./websocket");

var ami = new require('asterisk-manager')(amiConf.port, amiConf.host, amiConf.username, amiConf.password, true);
//https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events
//https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Actions
ami.keepConnected();

ami.on('fullybooted', function(evt) {
	myLib.consoleLog('log', 'init AMI', "Connected to asterisk! Initializing state");
	s.asterisk = {
		channels: {},
		conference: {
			input: null,
			output: null,
//			members: {},
			lineout: null
		},
		master: {
		}
	};
	for (var dongleName in astConf.dongles) {
		s.ui.mixer.channels[dongleName] = {
			level: 50,
			number: astConf.dongles[dongleName].number,
			autoanswer: null,
			mode: 'defunct',
			recording: false
		};
		s.asterisk.channels[dongleName] = {};
		s.channels[dongleName] = {
			provider: "asterisk"
		};
	}

	ami.action({
		action: "DongleShowDevices"
	}, function(err, res) {
		//{"response":"Success","actionid":"1446811737040","eventlist":"start","message":"Device status list will follow"}
		if (!err && res.response === 'Success') { // 'dongledeviceentry' events will follow
			 myLib.consoleLog('log', 'init Dongle', 'driver is talking');
		} else {
			myLib.consoleLog('error', 'init Dongle', JSON.stringify(err) + " " + JSON.stringify(res));
		}
	});

	ami.action({
		action: "SIPpeerstatus"
	}, function(err, res) {
		if (!err && res.response === 'Success') { // 'peerstatus' events will follow
			 myLib.consoleLog('log', 'init SIP', 'driver is talking');
		} else {
			myLib.consoleLog('error', 'init SIP', JSON.stringify(err) + " " + JSON.stringify(res));
		}
	});

	ami.action({
		action: "CoreShowChannels"
	}, function(err, res) {
	});

	ami.action({
		action: "ConfbridgeList",
		conference: astConf.conference
	}, function(err, res) {
		// { response: 'Success', actionid: '1447157967259', eventlist: 'start', message: 'Confbridge user list will follow' }
		if (!err && res.response === 'Success') { // 'confbridgelist' events will follow
			myLib.consoleLog('log', "ConfbridgeList", res);
		} else {
			myLib.consoleLog('error', "ConfbridgeList", JSON.stringify(res));
			ami.action({
				action: "Command",
				command: "console dial " + astConf.conference + "@from-internal"
			}, function(err, res) {
				if (!err) {
					s.ui.mixer.master.on_air = true;
				}
				myLib.consoleLog('log', "Conference-onAir", res);

			});

		}
	});

});



// debug: catch all AMI events
ami.on('managerevent', function(evt) {
	if (evt.event != "ConfbridgeTalking" && evt.event != 'Newexten' && evt.event != 'VarSet' && evt.event.indexOf("Dongle") !== 0 && evt.event.indexOf("RTCP") !== 0) {
		console.error(JSON.stringify(evt));
	}
	// else console.error(JSON.stringify(evt));
});

ami.on('donglecallstatechange', function(evt) {
//	{"event":"DongleCallStateChange","privilege":"call,all","device":"airtel2","callidx":"1","newstate":"released"}

	console.error(JSON.stringify(evt));
});

ami.on('donglenewsms', function(evt) {
	console.error(JSON.stringify(evt));
});

ami.on('donglenewsmsbase64', function(evt) {
	console.error(JSON.stringify(evt));
});

ami.on('donglestatus', function(evt) {
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Free"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Disconnect"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Connect"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Initialize"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Used"}
	if (evt.status === 'Free' && s.asterisk.channels[evt.device] && s.ui.mixer.channels[evt.device] && s.ui.mixer.channels[evt.device].mode != 'free') {
		setDongleFree(evt.device);
	}
	if (evt.status != 'Register' && evt.status != 'Unregister') {
		console.error(JSON.stringify(evt));
	}
});

function setDongleFree(dongleName) {
	s.ui.mixer.channels[dongleName].mode = 'free';
	s.ui.mixer.channels[dongleName].duration = null;
	s.ui.mixer.channels[dongleName].direction = null;
	var channel = {};
	channel[dongleName] = s.ui.mixer.channels[dongleName];
	wss.broadcast("channelUpdate", channel);
	s.asterisk.channels[dongleName].internalName = null;
}
ami.on('donglecend', function(evt) {
//	{"event":"DongleCEND","privilege":"call,all","device":"airtel2","callidx":"1","duration":"0","endstatus":"29","cccause":"17"}
	console.error(JSON.stringify(evt));
});

ami.on('dongleportfail', function(evt) {
//	{"event":"DonglePortFail","privilege":"call,all","device":"/dev/ttyUSB2","message":"Response Failed"}
	console.error(JSON.stringify(evt));
});

ami.on('donglesmsstatus', function(evt) {
	console.error(JSON.stringify(evt));
});

ami.on('dongleshowdevicescomplete', function(evt) {
	console.error(JSON.stringify(evt));
});

// received after AMI action 'SIPpeers'
ami.on('peerentry', function(evt) {
//	{"event":"PeerEntry","actionid":"1447058788015","channeltype":"SIP","objectname":"701","chanobjecttype":"peer","ipaddress":"-none-","ipport":"0","dynamic":"yes","autoforcerport":"no","forcerport":"yes","autocomedia":"no","comedia":"yes","videosupport":"no","textsupport":"no","acl":"yes","status":"UNKNOWN","realtimedevice":"no","description":""}
//	{"event":"PeerEntry","actionid":"1447058788015","channeltype":"SIP","objectname":"702","chanobjecttype":"peer","ipaddress":"192.168.1.188","ipport":"40138","dynamic":"yes","autoforcerport":"no","forcerport":"no","autocomedia":"no","comedia":"no","videosupport":"no","textsupport":"no","acl":"yes","status":"OK (200 ms)","realtimedevice":"no","description":""}
});

// received after AMI action 'SIPpeerstatus'
ami.on('peerstatus', function(evt) {
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Unreachable","time":"-1"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Reachable","time":"25"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Lagged","time":"148"}

//	{"event":"PeerStatus","privilege":"System","channeltype":"SIP","peer":"SIP/701","peerstatus":"Unknown","actionid":"1447147680674"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Registered","address":"192.168.1.188:47441"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Unregistered","cause":"Expired"}

	var sipPeer = evt.peer.substring(4);
	if (astConf.hosts.indexOf(sipPeer) !== -1) {
		var peerStatus = evt.peerstatus.toLowerCase();
		switch (peerStatus) {
			case 'reachable':
			case 'registered':
				if (!s.ui.mixer.hosts[sipPeer] || s.ui.mixer.hosts[sipPeer].conn != 'reachable') {
					s.ui.mixer.hosts[sipPeer] = {
						recording: false,
						conn: 'reachable',
						mode: 'free'
					};
					wss.broadcast("hostUpdate", s.ui.mixer.hosts);
				}
				break;
			case 'unregistered':
			case 'unknown':
				if (s.ui.mixer.hosts[sipPeer]) {
					s.ui.mixer.hosts[sipPeer] = null;
					var newObj = {};
					newObj[sipPeer] = null;
					wss.broadcast("hostUpdate", newObj);
				}
				break;
		}
	}
	console.error(JSON.stringify(evt));
});

ami.on('confbridgeleave', function(evt) {
//	{"event":"ConfbridgeLeave","privilege":"call,all","channel":"Dongle/airtel2-0100000003","uniqueid":"1447320725.25","conference":"2663","calleridnum":"+255687754487","calleridname":"airtel2"}
	// todo: why is this even needed?
	if (evt.conference == astConf.conference) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.lineout = null;
			s.ui.mixer.master.on_air = false;
		} else {
			//delete s.asterisk.conference.members[channelInfo[1]];
		}
	}
});

// debug: track interesting events
ami.on('softhanguprequest', function(evt) {
	console.error(JSON.stringify(evt));
});

ami.on('coreshowchannel', function (evt) {
//	{"event":"CoreShowChannel","actionid":"1447226096522","channel":"Bridge/0x142b4a4-input","uniqueid":"1447225493.21","context":"default","extension":"s","priority":"1","channelstate":"6","channelstatedesc":"Up","application":"","applicationdata":"","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"00:10:03","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447226096522","channel":"SIP/703-0000000b","uniqueid":"1447225488.20","context":"from-internal","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"703","calleridname":"Damjan Laptop","connectedlinenum":"","connectedlinename":"","duration":"00:10:08","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}

//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"Dongle/airtel2-0100000002","uniqueid":"1447318681.23","context":"ext-meetme","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"+255687754487","calleridname":"airtel2","connectedlinenum":"703","connectedlinename":"Damjan Laptop","duration":"00:01:02","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"Bridge/0x76718a54-output","uniqueid":"1447318654.22","context":"default","extension":"s","priority":"1","channelstate":"6","channelstatedesc":"Up","application":"","applicationdata":"","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"00:01:28","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"SIP/702-00000010","uniqueid":"1447318623.18","context":"ext-meetme","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"702","calleridname":"local udp","connectedlinenum":"703","connectedlinename":"Damjan Laptop","duration":"00:02:00","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"Bridge/0x76718a54-input","uniqueid":"1447318654.21","context":"default","extension":"s","priority":"1","channelstate":"6","channelstatedesc":"Up","application":"","applicationdata":"","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"00:01:28","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}

	var channelInfo = evt.channel.split(/[\/-]/, 3);
	var newChannel = {};
	switch (channelInfo[0]) {
		case 'Dongle':
			//s.asterisk.channels[channelInfo[1]].type = channelId[0];
			s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
			newChannel[channelInfo[1]] = s.ui.mixer.channels[channelInfo[1]];
			newChannel[channelInfo[1]].mode = evt.channelstatedesc.toLowerCase();
			newChannel[channelInfo[1]].contact = {
				number: evt.calleridnum,
				name:  evt.calleridname
			};
			wss.broadcast("channelUpdate", newChannel);
			break;
		case 'SIP':
			//todo : where is this channel dialing?
			if (astConf.extensions.indexOf(channelInfo[1]) !== -1) {
				s.asterisk.channels[channelInfo[1]] = {
					internalName: evt.channel,
				};
				s.channels[channelInfo[1]] = {
					provider: 'asterisk'
				};
				newChannel[channelInfo[1]] = {
					type: channelInfo[0].toLowerCase(),

				}
			}
			//s.channels[evt.calleridnum] = evt;
			break;
		case 'ALSA':
		default:
	}

});

// shout happen only on init
ami.on('confbridgelist', function (evt) {
//	{"event":"ConfbridgeList","actionid":"1447157967259","conference":"2663","calleridnum":"703","calleridname":"Damjan Laptop","channel":"SIP/703-00000009","admin":"No","markeduser":"No","muted":"No"}
	if (evt.conference == astConf.conference) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.lineout = evt.channel;
		} else {
			//s.asterisk.conference.members[channelInfo[1]] = evt.channel;
			s.ui.mixer.channels[channelInfo[1]].mode = 'master';
		}
	}
});

ami.on('confbridgejoin', function(evt) {
//	{"event":"ConfbridgeJoin","privilege":"call,all","channel":"SIP/703-00000000","uniqueid":"1444910756.0","conference":"2663","calleridnum":"703","calleridname":"Damjan Laptop"}
	if (evt.conference == astConf.conference) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.lineout = evt.channel;
		} else {
			//s.asterisk.conference.members[channelInfo[1]] = evt.channel;
			s.ui.mixer.channels[channelInfo[1]].mode = 'master';
		}
	}
	console.log(JSON.stringify(evt));
});


// todo: check if these events show "uninvited"
ami.on('dongledeviceentry', function(evt) {
//	{"event":"DongleDeviceEntry","actionid":"1446811737040","device":"airtel1","audiosetting":"","datasetting":"","imeisetting":"354369047238739","imsisetting":"","channellanguage":"mk","context":"from-trunk","exten":"+1234567890","group":"0","rxgain":"4","txgain":"1","u2diag":"0","usecallingpres":"Yes","defaultcallingpres":"Presentation Allowed, Passed Screen","autodeletesms":"Yes","disablesms":"No","resetdongle":"Yes","smspdu":"Yes","callwaitingsetting":"disabled","dtmf":"relax","minimaldtmfgap":"45","minimaldtmfduration":"80","minimaldtmfinterval":"200","state":"Free","audiostate":"/dev/ttyUSB4","datastate":"/dev/ttyUSB5","voice":"Yes","sms":"Yes","manufacturer":"huawei","model":"E1731","firmware":"11.126.16.04.284","imeistate":"354369047238739","imsistate":"640050939309334","gsmregistrationstatus":"Registered, home network","rssi":"11, -91 dBm","mode":"WCDMA","submode":"WCDMA","providername":"celtel","locationareacode":"50","cellid":"BBE887E","subscribernumber":"+255689514544","smsservicecenter":"+255780000004","useucs2encoding":"Yes","ussduse7bitencoding":"No","ussduseucs2decoding":"Yes","tasksinqueue":"0","commandsinqueue":"0","callwaitingstate":"Disabled","currentdevicestate":"start","desireddevicestate":"start","callschannels":"0","active":"0","held":"0","dialing":"0","alerting":"0","incoming":"0","waiting":"0","releasing":"0","initializing":"0"}

	if (s.ui.mixer.channels[evt.device].number === evt.subscribernumber) {
		var dongleState = evt.state.toLowerCase();
		switch (dongleState) {
			case 'free':
			case 'ring':
			case 'dialing':
				s.ui.mixer.channels[evt.device].mode = dongleState;
				s.asterisk.channels[evt.device] = {};
				break;
			case 'incoming':
			case 'outgoing':
				// todo: find and set real mode
				s.ui.mixer.channels[evt.device].mode = 'master';
				s.ui.mixer.channels[evt.device].direction = dongleState;
				s.asterisk.channels[evt.device] = {};
				break;
			case 'sms':
				// todo: hm...
				break;
			case 'gsm not registered':
			default:
				myLib.consoleLog('error', 'dongleState', dongleState);
				s.ui.mixer.channels[evt.device].number += " " + dongleState;
		}
	} else {
		myLib.consoleLog('error', 'number on SIM card not same as number in config');
		s.ui.mixer.channels[evt.device].number += " number on SIM not matching: " + evt.subscribernumber ;
	}
	console.error(JSON.stringify(evt));
});



/*
    DongleDeviceEntry
    DongleShowDevicesComplete
    DongleUSSDStatus
    DongleSMSStatus
    DongleNewCUSD
    DongleNewUSSD
    DongleNewUSSDBase64
    DongleCEND
    DongleCallStateChange
    DongleStatus
    DongleNewCMGR
    DongleNewSMS
    DongleNewSMSBase64
    DonglePortFail
*/

//{"event":"Newchannel","privilege":"call,all","channel":"SIP/703-00000000","channelstate":"0","channelstatedesc":"Down","calleridnum":"703","calleridname":"Damjan Laptop","accountcode":"","exten":"2663","context":"from-internal","uniqueid":"1445360462.0"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-input","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.1"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-output","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.2"}
//{"event":"Newchannel","privilege":"call,all","channel":"Dongle/airtel2-0100000000","channelstate":"4","channelstatedesc":"Ring","calleridnum":"+255682120818","calleridname":"airtel2","accountcode":"","exten":"+255788333330","context":"from-trunk","uniqueid":"1446819272.2"}
ami.on('newchannel', function(evt) {
	console.log(JSON.stringify(evt));
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	var newChannel = {};
	switch (channelInfo[0]) {
		case 'Dongle':
			//s.asterisk.channels[channelInfo[1]].type = channelId[0];
			s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
			newChannel[channelInfo[1]] = s.ui.mixer.channels[channelInfo[1]];
			newChannel[channelInfo[1]].mode = evt.channelstatedesc.toLowerCase();
			newChannel[channelInfo[1]].contact = {
				number: evt.calleridnum,
				name:  evt.calleridname
			};
			wss.broadcast("channelUpdate", newChannel);
			break;
		case 'SIP':
			//todo : where is this channel dialing?
			if (astConf.extensions.indexOf(channelInfo[1]) !== -1) {
				s.asterisk.channels[channelInfo[1]] = {
					internalName: evt.channel,
				};
				s.channels[channelInfo[1]] = {
					provider: 'asterisk'
				};
				newChannel[channelInfo[1]] = {
					type: channelInfo[0].toLowerCase(),

				}
			}
			//s.channels[evt.calleridnum] = evt;
			break;
		default:
	}
});

// helper functions

function amiSimpleAction(action, channel, cb) {
	ami.action({
		action: action,
		channel: channel,
	}, function(err, res) {
		if (!err) {
			if (cb) {
				cb(res);
			} else {
				console.log(JSON.stringify(res));
			}
		} else {
			if (cb) {
				cb(err,res);
			} else {
				console.log(JSON.stringify(err));
			}
		}
	});
}

function amiAction(options, cb) {
	ami.action(options, function(err, res) {
		if (!err) {
			if (cb) {
				cb(res);
			} else {
				console.log(JSON.stringify(res));
			}
		} else {
			if (cb) {
				cb(err,res);
			} else {
				console.log(JSON.stringify(err));
			}
		}
	});
}


function amiSimpleCommand(command, cb) {
	ami.action({
		action: 'command',
		command: command
	}, function(err, res) {
		if (!err) {
			if (cb) {
				cb(res);
			} else {
				console.log(JSON.stringify(res));
			}
		} else {
			if (cb) {
				cb(err,res);
			} else {
				console.log(JSON.stringify(err));
			}
		}
	});
}

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

function connectToMaster(channel_id) {
/*
	ACTION: Redirect
	Channel: SIP/x7065558529-8f54
	Context: default
	Exten: 5558530
	Priority: 1
*/
	ami.action({
		action: "Redirect",
		channel: s.asterisk.channels[channel_id].internalName,
		context: "from-internal",
		exten: astConf.conference,
		priority: 1
	}, function(err, res) {
		if (!err) {
			console.log(JSON.stringify(res));
		} else {
			console.log(JSON.stringify(res));
		}
	});
};

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

function setAmiChannelVolume(channel, level, direction) {
	if (channel) { // temp
		var variable = 'VOLUME(' + direction + ')';
		console.log(channel, variable, level);
		// todo: use the setVar function
		ami.action({
			action: 'Setvar',
			channel: channel,
			variable: variable,
			value: level
		}, function(err, res) {
			if (!err) {
				console.log(JSON.stringify(res));
			} else {
				console.error(JSON.stringify(res));
			}
		});
	} else {
		myLib.consoleLog('error', 'setAmiChannelVolume', 'channel not found');
	}
}

function sendSMS(device, number, content) {
	ami.action({
		action: 'DongleSendSMS',
		Device: device,
		"Number": number,
		Message: content
	}, function(err, res) {
		if (!err) {
			console.log('sms ok', JSON.stringify(res));
		} else {
			console.error('sms err', JSON.stringify(err));
		}
	});
}

function setAmiChannelMuted(channel, value, direction) {
	if (channel) { // temp
		var variable = 'VOLUME(' + direction + ')';
		console.log(channel, variable, value);
		// todo: use the setVar function
		ami.action({
			action: 'MuteAudio',
			channel: channel,
			direction: direction,
			state: value
		}, function(err, res) {
			if (!err) {
				console.log(JSON.stringify(res));
			} else {
				console.error(JSON.stringify(res));
			}
		});
	}
}

exports.sendSMS = sendSMS;
exports.connectNumbers = connectNumbers;
exports.setChannelVolume = function (channel_id, value) {
	var direction = "RX";
	//adjust volume levels. 0 to 100 -> -30 to +20
	value = value / 2 - 25;
	setAmiChannelVolume(s.asterisk.channels[channel_id].internalName, value, direction);
};
exports.connectToMaster = connectToMaster;
exports.setMasterVolume = function (value) {
	var direction = "TX";
	value = value / 2 - 25;
	setAmiChannelVolume(s.asterisk.conference.lineout, value, direction);
};
exports.setChannelMuted = function (channel_id, value) {
	var direction = "in";
	setAmiChannelMuted(s.asterisk.channels[channel_id].internalName, value, direction);
};

exports.setMasterMuted = function (value) {
	var direction = "out";
	setAmiChannelMuted(s.asterisk.conference.lineout, value, direction);
};
