var amiConf = require("./config/ami.json");
var astConf = require("./config/asterisk.json");

var myLib = require("./myLib");
var s = require("./localStorage");
var api = require("./api");

var ami = new require('asterisk-manager')(amiConf.port, amiConf.host, amiConf.username, amiConf.password, true);
// https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AMI+Events
// https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AMI+Actions
ami.keepConnected();

// start initialization sequence
// this code is executed when our app (re)connects to Asterisk
ami.on('fullybooted', function(evt) {
	myLib.consoleLog('log', "init", "Asterisk interface ready!");
	ami.action({
		action: "DongleShowDevices"
	}, function(err, res) {
		//{"response":"Success","actionid":"1446811737040","eventlist":"start","message":"Device status list will follow"}
		if (!err && res.response === 'Success') { // 'dongledeviceentry' events will follow, ends with 'DongleShowDevicesComplete'
			myLib.consoleLog('log', "init", 'Dongle driver is talking');
		} else {
			myLib.consoleLog('error', 'init Dongle', JSON.stringify(err) + " " + JSON.stringify(res));
		}
	});
	ami.action({
		action: "DeviceStateList"
	}, function(err, res) {  // 'DeviceStateChange' events will follow, ends with 'DeviceStateListComplete'
		// this must succeed
	});
/*
	ami.action({
		action: "CoreStatus"
		//action: "SIPpeerstatus"
		//action: "SIPpeers"
	}, function(err, res) {
		if (!err && res.response === 'Success') { // 'peerstatus' events will follow
			myLib.consoleLog('log', 'CoreStatus requested', JSON.stringify(res));
		} else {
			myLib.consoleLog('error', 'init SIP', JSON.stringify(err) + " " + JSON.stringify(res));
		}
	});
*/
});

// shoud happen only on init
ami.on('devicestatelistcomplete', function(evt) {
/*
	ami.action({
		action: "ExtensionStateList"
	}, function(err, res) { // 'ExtensionStatus' events will follow, ends with 'ExtensionStateListComplete'
	});
*/
	ami.action({
		action: "CoreShowChannels"
	}, function(err, res) {
		if (!err && res.response === 'Success') { // 'coreshowchannel' events will follow, ends with 'CoreShowChannelsComplete'
			myLib.consoleLog('log', "init", 'Dongle driver is talking');
		} else {
			myLib.consoleLog('error', 'init Dongle', JSON.stringify(err) + " " + JSON.stringify(res));
		}
	});

	ami.action({
		action: "ConfbridgeList",
		conference: astConf.virtual.master
	}, function(err, res) {
		// { response: 'Success', actionid: '1447157967259', eventlist: 'start', message: 'Confbridge user list will follow' }
		if (!err && res.response === 'Success') { // 'confbridgelist' events will follow
			myLib.consoleLog('log', "ConfbridgeList", res);
		} else {
			myLib.consoleLog('error', "ConfbridgeList", JSON.stringify(res));
			if (s.ui.mixer.master.on_air) {
				ami.action({
					action: "Command",
					command: "console dial " + astConf.virtual.master + "@from-internal"
				}, function(err, res) {
					if (!err) {
						s.ui.mixer.master.on_air = true;
					}
					myLib.consoleLog('log', "Conference-onAir", res);

				});
			}
//			var channel = "Local/707@from-internal/n";
/*
			var channel = "SIP/703";
			amiOriginate(channel, astConf.virtual.master, function (err) {
				if (!err) {
					s.ui.mixer.channels['703'].mode = 'master';
				} else {
					myLib.consoleLog('debug', 'xxx', err);
				}
			});
*/
		}
	});
});

// shoud happen only on init
ami.on('dongledeviceentry', function(evt) {
//	{"event":"dongledeviceentry","actionid":"1446811737040","device":"airtel1","audiosetting":"","datasetting":"","imeisetting":"354369047238739","imsisetting":"","channellanguage":"mk","context":"from-trunk","exten":"+1234567890","group":"0","rxgain":"4","txgain":"1","u2diag":"0","usecallingpres":"yes","defaultcallingpres":"presentation allowed, passed screen","autodeletesms":"yes","disablesms":"no","resetdongle":"yes","smspdu":"yes","callwaitingsetting":"disabled","dtmf":"relax","minimaldtmfgap":"45","minimaldtmfduration":"80","minimaldtmfinterval":"200","state":"free","audiostate":"/dev/ttyusb4","datastate":"/dev/ttyusb5","voice":"yes","sms":"yes","manufacturer":"huawei","model":"e1731","firmware":"11.126.16.04.284","imeistate":"354369047238739","imsistate":"640050939309334","gsmregistrationstatus":"registered, home network","rssi":"11, -91 dbm","mode":"wcdma","submode":"wcdma","providername":"celtel","locationareacode":"50","cellid":"bbe887e","subscribernumber":"+255689514544","smsservicecenter":"+255780000004","useucs2encoding":"yes","ussduse7bitencoding":"no","ussduseucs2decoding":"yes","tasksinqueue":"0","commandsinqueue":"0","callwaitingstate":"disabled","currentdevicestate":"start","desireddevicestate":"start","callschannels":"0","active":"0","held":"0","dialing":"0","alerting":"0","incoming":"0","waiting":"0","releasing":"0","initializing":"0"}
//	{"event":"dongledeviceentry","actionid":"1448708202036","device":"airtel2","audiosetting":"","datasetting":"","imeisetting":"354369047217469","imsisetting":"","channellanguage":"mk","context":"from-trunk","exten":"+1234567890","group":"0","rxgain":"4","txgain":"1","u2diag":"0","usecallingpres":"yes","defaultcallingpres":"presentation allowed, passed screen","autodeletesms":"yes","disablesms":"no","resetdongle":"yes","smspdu":"yes","callwaitingsetting":"disabled","dtmf":"relax","minimaldtmfgap":"45","minimaldtmfduration":"80","minimaldtmfinterval":"200","state":"gsm not registered","audiostate":"/dev/ttyusb1","datastate":"/dev/ttyusb2","voice":"yes","sms":"yes","manufacturer":"huawei","model":"e1731","firmware":"11.126.16.04.284","imeistate":"354369047217469","imsistate":"640050938039425","gsmregistrationstatus":"registration denied","rssi":"15, -83 dbm","mode":"wcdma","submode":"wcdma","providername":"none","locationareacode":"50","cellid":"bbe8881","subscribernumber":"+255788333330","smsservicecenter":"+255780000004","useucs2encoding":"yes","ussduse7bitencoding":"no","ussduseucs2decoding":"yes","tasksinqueue":"0","commandsinqueue":"0","callwaitingstate":"disabled","currentdevicestate":"start","desireddevicestate":"start","callschannels":"0","active":"0","held":"0","dialing":"0","alerting":"0","incoming":"0","waiting":"0","releasing":"0","initializing":"0"}
	if (astConf.dongles[evt.device] ) { // check if device is configured in fessbox
		if (!s.ui.mixer.channels[evt.device]) { // sanity check
			myLib.consoleLog('panic', 'configured dongle not present', evt.device);
		} else {
			//todo: is this the right place to to this?
			s.ui.mixer.channels[evt.device].direction = astConf.operators.indexOf(evt.device) !== -1 ? 'operator' : null;
			s.ui.mixer.channels[evt.device].number = astConf.dongles[evt.device].number;

			if (astConf.dongles[evt.device].number !== evt.subscribernumber) {
				// todo: send email to admin
				if (evt.subscribernumber) {
					myLib.consoleLog('error', 'number on sim card not same as number in config', evt.subscribernumber);
				} else {
					myLib.consoleLog('error', "can't read number from sim", evt.device);
				}
				s.ui.mixer.channels[evt.device].error = "number on sim not matching: " + evt.subscribernumber;
			}
				// default dongle mode is 'defunct'
				var dongleState = evt.state.toLowerCase();
				switch (dongleState) {
					case 'free':
						s.ui.mixer.channels[evt.device].mode = dongleState;
						s.asterisk.channels[evt.device] = {};
						break;
					case 'ring':
						s.ui.mixer.channels[evt.device].mode = 'ring';
						s.ui.mixer.channels[evt.device].direction = 'incoming';
						s.asterisk.channels[evt.device] = {};
						break;
					case 'dialing':
						s.ui.mixer.channels[evt.device].direction = 'outgoing';
						s.ui.mixer.channels[evt.device].mode = 'ring';
						s.asterisk.channels[evt.device] = {};
						break;
					case 'incoming':
					case 'outgoing':
						// todo: find and set real mode
		//				s.ui.mixer.channels[evt.device].mode = 'master';
						s.ui.mixer.channels[evt.device].direction = dongleState;
						s.asterisk.channels[evt.device] = {};
						break;
					case 'sms':
						// todo: hm...
						break;
					case 'gsm not registered':
						myLib.consoleLog('log', 'dongle not registered, reseting', evt.device);
						ami.action({
							action: "DongleReset",
							device: evt.device
						}, function(err, res) {
							if (err) {
								myLib.consoleLog('error', "DongleReset", evt.device);
							}
						});
					case 'not connected':
					default:
						myLib.consoleLog('error', 'dongleState', dongleState);
						s.ui.mixer.channels[evt.device].error = dongleState;
				}

		}
	}
	console.error(JSON.stringify(evt));
});

// initialize live channels on application boot
ami.on('coreshowchannel', function (evt) {
//	{"event":"CoreShowChannel","actionid":"1449750312397","channel":"Dongle/airtel2-0100000002","uniqueid":"1449750295.11","context":"from-internal","extension":"198","priority":"1","channelstate":"4","channelstatedesc":"Ring","application":"Wait","applicationdata":"100","calleridnum":"+255687754487","calleridname":"airtel1 aleksandra","connectedlinenum":"","connectedlinename":"","duration":"00:00:16","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447226096522","channel":"Bridge/0x142b4a4-input","uniqueid":"1447225493.21","context":"default","extension":"s","priority":"1","channelstate":"6","channelstatedesc":"Up","application":"","applicationdata":"","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"00:10:03","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447226096522","channel":"SIP/703-0000000b","uniqueid":"1447225488.20","context":"from-internal","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"703","calleridname":"Damjan Laptop","connectedlinenum":"","connectedlinename":"","duration":"00:10:08","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1448370162017","channel":"ALSA/hw:0,0","uniqueid":"1448348233.0","context":"from-internal","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"06:05:28","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"Dongle/airtel2-0100000002","uniqueid":"1447318681.23","context":"ext-meetme","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"+255687754487","calleridname":"airtel2","connectedlinenum":"703","connectedlinename":"Damjan Laptop","duration":"00:01:02","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"Bridge/0x76718a54-output","uniqueid":"1447318654.22","context":"default","extension":"s","priority":"1","channelstate":"6","channelstatedesc":"Up","application":"","applicationdata":"","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"00:01:28","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"SIP/702-00000010","uniqueid":"1447318623.18","context":"ext-meetme","extension":"STARTMEETME","priority":"5","channelstate":"6","channelstatedesc":"Up","application":"ConfBridge","applicationdata":"2663,,,","calleridnum":"702","calleridname":"local udp","connectedlinenum":"703","connectedlinename":"Damjan Laptop","duration":"00:02:00","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}
//	{"event":"CoreShowChannel","actionid":"1447318743566","channel":"Bridge/0x76718a54-input","uniqueid":"1447318654.21","context":"default","extension":"s","priority":"1","channelstate":"6","channelstatedesc":"Up","application":"","applicationdata":"","calleridnum":"","calleridname":"","connectedlinenum":"","connectedlinename":"","duration":"00:01:28","accountcode":"","bridgedchannel":"","bridgeduniqueid":""}

	var channelInfo = evt.channel.split(/[\/-]/, 3);
	var newChannel = {};

	switch (channelInfo[0]) {
		case 'Dongle':
			if (s.asterisk.channels[channelInfo[1]]) {
				var channelState = evt.channelstatedesc.toLowerCase();
				switch (channelState) {
					case 'ring':
						s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
						api.channelUpdate({
							mode: 'ring',
							direction: 'incoming',
							timestamp: Date.now() - myLib.msecDuration(evt.duration),
							contact: {
								number: evt.calleridnum,
								name: evt.calleridname
							}
						});
						break;
					case 'up':
						s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
						if (evt.application === 'ConfBridge') {
							var appData = evt.applicationdata.split(',', 4);
							if (appData[0] === 'astConf.virtual.master') {
								api.channelUpdate({
									mode: 'master',
									direction: 'incoming',
									timestamp: Date.now() - myLib.msecDuration(evt.duration),
									contact: {
										number: evt.calleridnum,
										name: evt.calleridname
									}
								});
							}
						}
						break;
				}
			}
//		case 'Local':
		case 'SIP':
			if (astConf.operators.indexOf(channelInfo[1]) !== -1) {
					console.log('internal name set', evt.channel);
				s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
				if (evt.application === "ConfBridge") { //todo: make sure is the 'master' conference
					s.ui.mixer.channels[channelInfo[1]].mode = 'master';
				} else {
					s.ui.mixer.channels[channelInfo[1]].mode = 'free'; //todo: find the correct channel_id
				}
			} else if (astConf.extensions.indexOf(channelInfo[1]) !== -1) {
				s.asterisk.channels[channelInfo[1]] = {
					internalName: evt.channel,
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
	
// shoud happen only on init
ami.on('confbridgelist', function (evt) {
//	{"event":"ConfbridgeList","actionid":"1447157967259","conference":"2663","calleridnum":"703","calleridname":"Damjan Laptop","channel":"SIP/703-00000009","admin":"No","markeduser":"No","muted":"No"}
	if (evt.conference == astConf.virtual.master) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.on_air = evt.channel;
		} else {
			//console.log(s.ui.mixer.channels, channelInfo[1]);
			//s.asterisk.conference.members[channelInfo[1]] = evt.channel;
			s.ui.mixer.channels[channelInfo[1]].mode = 'master';
			s.ui.mixer.channels[channelInfo[1]].muted = evt.muted === "No" ? false : true;
		}
	}
});
// end initialization code

ami.on('devicestatechange', function(evt) {
//	{"event":"DeviceStateChange","privilege":"call,all","device":"SIP/702","state":"NOT_INUSE"}
//	{"event":"DeviceStateChange","privilege":"call,all","device":"SIP/702","state":"UNAVAILABLE"}
//	{"event":"DeviceStateChange","privilege":"call,all","device":"SIP/702","state":"INUSE"}
//	console.error(JSON.stringify(evt));
	var channelInfo = evt.device.split(/[\/-]/, 2);
	// check if extension is configured in fessbox
	if (channelInfo[0] === 'SIP' && astConf.operators.indexOf(channelInfo[1]) !== -1) {
		switch (evt.state) {
			case 'UNAVAILABLE':
				if (s.ui.mixer.channels[channelInfo[1]] && s.ui.mixer.channels[channelInfo[1]].mode !== 'defunct') {
					// todo: channels should have 'allways visible' property. If set, mode should be updated to 'defunct' instead of removing channel
					s.saveChannel(channelInfo[1]);
					s.saveUser(channelInfo[1]);
					//api.channelUpdate(channelInfo[1], null);
					api.channelUpdate(channelInfo[1], {
						mode: 'defunct'
					});
				}
				break;
			case 'NOT_INUSE':
				if (!s.ui.mixer.channels[channelInfo[1]]) {
					s.loadChannel(channelInfo[1]);
					//s.ui.mixer.channels[channelInfo[1]].type = 'sip';
					//s.ui.mixer.channels[channelInfo[1]].mode = 'free';
					//s.ui.mixer.channels[channelInfo[1]].direction = 'operator';
					api.channelUpdate(channelInfo[1], {
						type: 'sip',
						mode: 'free',
						direction: 'operator'
					});
					s.loadUser(channelInfo[1]);
				} else if (s.ui.mixer.channels[channelInfo[1]].mode !== 'free') {
					//todo: write proper function for setting channel free
					api.channelUpdate(channelInfo[1], {
						mode: 'free'
					});
				}
				break;
			case 'INUSE':
				if (!s.ui.mixer.channels[channelInfo[1]]) {
					s.loadChannel(channelInfo[1]);
					//s.ui.mixer.channels[channelInfo[1]].type = 'sip';
					//s.ui.mixer.channels[channelInfo[1]].mode = 'free';
					//s.ui.mixer.channels[channelInfo[1]].direction = 'operator';
					api.channelUpdate(channelInfo[1], {
						type: 'sip',
						mode: 'master',
						direction: 'operator'
					});
					s.loadUser(channelInfo[1]);
				}

				break;
		}
	}
});

ami.on('donglecallstatechange', function(evt) {
//	{"event":"DongleCallStateChange","privilege":"call,all","device":"airtel2","callidx":"1","newstate":"released"}
//	console.error(JSON.stringify(evt));
});

ami.on('donglenewsmsbase64', function(evt) {
	var prefix = new RegExp('^\\' + amiConf.country_prefix);
	api.inboxUpdate('sms_in', Date.now(), evt.from.replace(prefix, '0'), new Buffer(evt.message, 'base64').toString("utf8"));
//	console.error(JSON.stringify(evt));
});

//todo: get user info via addressBook api call on newchannel event instead of using this event
ami.on('newcallerid', function(evt) {
//	{"event":"NewCallerid","privilege":"call,all","channel":"Dongle/airtel2-0100000004","calleridnum":"+255688755855","calleridname":"airtel2-xxx","uniqueid":"1449483797.31","cid-callingpres":"0 (Presentation Allowed, Not Screened)"}
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	if (s.ui.mixer.channels[channelInfo[1]]) {
		api.channelUpdate(channelInfo[1], { contact: {
			name: evt.calleridname,
			number: evt.calleridnum
		}});
	}
});

ami.on('donglestatus', function(evt) {
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Free"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Disconnect"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Connect"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Initialize"}
//	{"event":"DongleStatus","privilege":"call,all","device":"airtel2","status":"Used"}
	if (s.asterisk.channels[evt.device] && s.ui.mixer.channels[evt.device]) {
		switch (evt.status) {
			case 'Free':
			case 'Initialize':
				if (s.ui.mixer.channels[evt.device].mode !== 'free') {
					api.changeMode(evt.device, 'free');
				}
				break;
			case 'Disconnect':
				if (s.ui.mixer.channels[evt.device].mode !== 'defunct') {
					s.asterisk.channels[evt.device].internalName = null;
					api.changeMode(evt.device, 'defunct');
				}
				break;
		}
	}
	// debug
//	if (evt.status != 'Register' && evt.status != 'Unregister') {
		console.error(JSON.stringify(evt));
//	}
});

ami.on('musiconhold', function(evt) {
//	{"event":"MusicOnHold","privilege":"call,all","state":"Stop","channel":"ALSA/hw:0,0","uniqueid":"1448348233.0"}
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	if (s.asterisk.channels[channelInfo[1]] && evt.state === "Start") {
		api.channelUpdate(channelInfo[1], { mode: 'on_hold' });
	}
});

// todo: catch only remote party initiated hangup
ami.on('hangup', function(evt) {
//	{"event":"Hangup","privilege":"call,all","channel":"Dongle/airtel1-0100000006","uniqueid":"1448369795.17","calleridnum":"+255687754487","calleridname":"airtel1","connectedlinenum":"707","connectedlinename":"host galaxy tab","accountcode":"","cause":"17","cause-txt":"User busy"}
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	if (s.asterisk.channels[channelInfo[1]]) {
		s.asterisk.channels[channelInfo[1]].internalName = null;
		api.channelUpdate(channelInfo[1], {
			mode: 'free'
		});
	}	
});

ami.on('confbridgejoin', function(evt) {
//	{"event":"ConfbridgeJoin","privilege":"call,all","channel":"SIP/703-00000000","uniqueid":"1444910756.0","conference":"2663","calleridnum":"703","calleridname":"Damjan Laptop"}
	if (evt.conference === astConf.virtual.master) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (s.asterisk.channels[channelInfo[1]]) {
			s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
			api.channelUpdate(channelInfo[1], { mode: 'master' });
		} else if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.on_air = evt.channel;
			//api.masterUpdate({ on_air: true });
		}
	}
});

ami.on('confbridgeleave', function(evt) {
//	{"event":"ConfbridgeLeave","privilege":"call,all","channel":"Dongle/airtel2-0100000003","uniqueid":"1447320725.25","conference":"2663","calleridnum":"+255687754487","calleridname":"airtel2"}
	// todo: why is this even needed?
	/*
	if (evt.conference == astConf.virtual.master) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (channelInfo[0] === 'ALSA') {
			//s.asterisk.conference.on_air = null; //?
			//api.masterUpdate({ on_air: true });
		} else {
			//delete s.asterisk.conference.members[channelInfo[1]];
		}
	}
   */
});


ami.on('newchannel', function(evt) {
//{"event":"Newchannel","privilege":"call,all","channel":"SIP/703-00000000","channelstate":"0","channelstatedesc":"Down","calleridnum":"703","calleridname":"Damjan Laptop","accountcode":"","exten":"2663","context":"from-internal","uniqueid":"1445360462.0"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-input","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.1"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-output","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.2"}
//{"event":"Newchannel","privilege":"call,all","channel":"Dongle/airtel2-0100000000","channelstate":"4","channelstatedesc":"Ring","calleridnum":"+255682120818","calleridname":"airtel2","accountcode":"","exten":"+255788333330","context":"from-trunk","uniqueid":"1446819272.2"}
	console.log(JSON.stringify(evt));
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	var newChannel = {};
	switch (channelInfo[0]) {
		case 'Dongle':
			if (s.ui.mixer.channels[channelInfo[1]]) {
				//myLib.consoleLog('debug', "New dongle channel internal name", [channelInfo[1], evt.channel]);
				s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
				switch (evt.channelstatedesc) {
					case 'Ring':
						api.channelUpdate(channelInfo[1], {
							type: channelInfo[0],
							mode: 'ring',
							direction: 'incoming',
							timestamp: Date.now(),
							contact: {
								number: evt.calleridnum,
								name:  evt.calleridname
							}
						});
						console.log("xxx", channelInfo[1], s.ui.mixer.channels);
						console.log("setting initial chan volume", s.ui.mixer.channels[channelInfo[1]].level);
						//setAmiChannelVolume(evt.channel, s.ui.mixer.channels[channelInfo[1]].level, 'RX', function() {});
						exports.setChannelVolume(channelInfo[1], s.ui.mixer.channels[channelInfo[1]].level, function() {});
						if (s.ui.mixer.channels[channelInfo[1]].muted) {
							setAmiChannelMuted(evt.channel, true, 'in', function() {});
						}
						break;
				}
			}

			break;
		case 'SIP':
//		case 'Local':
			//todo : where is this channel dialing?
//			if (evt.exten === astConf.virtual.ring) {
				if (astConf.extensions.indexOf(channelInfo[1]) !== -1) {
					s.asterisk.channels[channelInfo[1]] = {
						internalName: evt.channel,
					};
					newChannel[channelInfo[1]] = {
						type: channelInfo[0].toLowerCase(),

					}
				} else if (astConf.operators.indexOf(channelInfo[1]) !== -1) {
					//myLib.consoleLog('debug', "New host channel internal name", [channelInfo[1], evt.channel]);
					s.asterisk.channels[channelInfo[1]] = {
						internalName: evt.channel
					};
					//setAmiChannelVolume(evt.channel, s.ui.mixer.channels[channelInfo[1]].level, 'RX', function() {});
					exports.setChannelVolume(channelInfo[1], s.ui.mixer.channels[channelInfo[1]].level, function() {});
					//setAmiChannelVolume(evt.channel, s.ui.users[channelInfo[1]].level, 'TX', function() {});
					exports.setUserVolume(channelInfo[1], s.ui.users[channelInfo[1]].level, function() {});
					if (s.ui.mixer.channels[channelInfo[1]].muted) {
						setAmiChannelMuted(evt.channel, true, 'in', function() {});
					}
					if (s.ui.users[channelInfo[1]].muted) {
						setAmiChannelMuted(evt.channel, true, 'out', function() {});
					}
	//				s.ui.mixer.hosts[channelInfo[1]] = s.loadHostSettings(channelInfo[1]);
	//				initializeHost(channelInfo[1]);
					
				}
//			}
			//s.channels[evt.calleridnum] = evt;
			break;
		default:
	}
});

ami.on('confbridgestoprecord', function (evt) {
	if (evt.conference === astConf.virtual.master) {
		api.inboxUpdate('recording', Date.now(), 'master', s.asterisk.conference.file_name);
		s.asterisk.conference.file_name = null;
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

function amiConnectToMaster(channel) {
/*
	ACTION: Redirect
	Channel: SIP/x7065558529-8f54
	Context: default
	Exten: 5558530
	Priority: 1
*/
	ami.action({
		action: "Redirect",
		channel: channel,
		context: "from-internal",
		exten: astConf.virtual.master,
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

function setAmiChannelMuted(channel, value, direction, cb) {
	ami.action({
		action: 'MuteAudio',
		channel: channel,
		direction: direction,
		state: value
	}, function(err, res) {
		if (!err) {
			cb();
		} else {
			cb(JSON.stringify(res));
		}
	});
}

function setAmiChannelVolume(channel, level, direction, cb) {
	if (channel) { // temp
		var variable = 'VOLUME(' + direction + ')';
		console.log("setting chan volume!", channel, variable, level);
		// todo: use the setVar function
		ami.action({
			action: 'Setvar',
			channel: channel,
			variable: variable,
			value: level
		}, function(err, res) {
			if (!err) {
				cb();
			} else {
				cb(JSON.stringify(res));
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

function amiHangup(channel, cb) {
	ami.action({
		action: 'Hangup',
		channel: channel,
		cause: 16
	}, function(err, res) {
		if (!err) {
			cb();
			console.log('hangup ok', JSON.stringify(res));
		} else {
			cb(JSON.stringify(err));
			console.error('hangup err', JSON.stringify(err));
		}
	});
}

function amiParkCall(channel, channel2, cb) {
	ami.action({
		action: "Park",
		channel: channel,
//		channel2: channel,
//		channel2: s.asterisk.channels["707"].internalName,
	}, cb);
}	

function amiOriginate(channel, destination, cb) {
//	{"response":"Error","actionid":"1448708544899","message":"Originate failed"}
//	{"response":"Success","actionid":"1448708544126","message":"Originate successfully queued"}
	ami.action({
		action: "Originate",
		channel: channel,
		context: "from-internal",
		exten: destination,
		priority: 1
	}, function(err, res) {
		if (!err) {
			cb();
			console.log("originate sucess!!", JSON.stringify(res));
		} else {
			cb(["originate error", channel, destination, res.message].join('::'));
		}
	});

}

function amiRedirect(channel, destination, cb) {
	myLib.consoleLog('debug', 'amiRedirect', [channel, destination]);
	ami.action({
		action: "Redirect",
		channel: channel,
		context: "from-internal",
		exten: destination,
		priority: 1
	}, function(err, res) {
		if (!err) {
			cb(null,res);
		} else {
			cb(JSON.stringify(res));
		}
		console.log(JSON.stringify(res));
	});
}

function amiRedirectBoth(channel, destination, channel2, destination2, cb) {
	ami.action({
		action: "Redirect",
		channel: channel,
		extrachannel: channel2,
		context: "from-internal",
		extracontext: "from-internal",
		exten: destination,
		extraexten: destination2,
		priority: 1,
		extrapriority: 1
	}, function(err, res) {
//		{"response":"Success","actionid":"1448369953448","message":"Dual Redirect successful"}
		if (!err) {
			cb();
			console.log(JSON.stringify(res));
		} else {
			cb(JSON.stringify(res));
			console.log(JSON.stringify(res));
		}
	});
}


// provider interface

exports.setChannelRecording = function (channel_id, value, cb) {
	//setAmiChannelMuted(s.asterisk.channels[channel_id].internalName, value, direction, cb);
};

exports.sendSMS = sendSMS;
exports.channelToMaster = function (channel_id, cb) {
	amiRedirect(s.asterisk.channels[channel_id].internalName, astConf.virtual.master, cb);
//	amiConnectToMaster(s.asterisk.channels[channel_id].internalName, cb);
};

exports.userToMaster = function (user_id, cb) {
//	var channel = "Local/" + user_id + "@from-internal/n";
	var channel = "SIP/" + user_id;
	amiOriginate(channel, astConf.virtual.master, cb);
//	amiRedirect(s.asterisk.channels[channel_id].internalName, astConf.virtual.master, cb);
//	amiConnectToMaster(s.asterisk.channels[channel_id].internalName, cb);
};

// broken
exports.toMaster = function (host_id, channel_id, cb) {
	amiRedirectBoth(s.asterisk.channels[channel_id].internalName, astConf.virtual.master, s.asterisk.hosts[host_id].internalName, astConf.virtual.master, cb);
//	amiConnectToMaster(s.asterisk.channels[channel_id].internalName, cb);
};

exports.connectToHost = function (channel_id, host_id, cb) {
	amiRedirect(s.asterisk.channels[channel_id].internalName, host_id, cb);
//	amiConnectToMaster(s.asterisk.channels[channel_id].internalName, cb);
};

/*
exports.putOnHold = function(channel_id, cb) {
	amiRedirect(s.asterisk.channels[channel_id].internalName, astConf.moh, cb);
//	amiOnHold(s.asterisk.channels[channel_id].internalName, cb);
}
*/

// use this when connecting to a channel_id that is busy
exports.setChanModeBusy = function(channel_id, busy_channel_id, cb) {

	amiParkCall(s.asterisk.channels[busy_channel_id].internalName, s.asterisk.channels[channel_id].internalName, function(err, res) {
		if (!err) {
			amiRedirect(s.asterisk.channels[channel_id].internalName, astConf.virtual.parked, cb);
		} else {
			cb(err);
		}
	});

};

// obsolete
exports.hangup = function (channel_id, cb) {
	amiHangup(s.asterisk.channels[channel_id].internalName, cb);
};


// api interface exports

exports.setChannelMuted = function (channel_id, value, cb) {
	if (s.asterisk.channels[channel_id] && s.asterisk.channels[channel_id].internalName) {
		var direction = "in";
		setAmiChannelMuted(s.asterisk.channels[channel_id].internalName, value, direction, cb);
	} else {
		cb("PANIC - channel not found: " + channel_id);
	}
};

exports.setUserMuted = function (user_id, value, cb) {
	if (s.asterisk.channels[user_id] && s.asterisk.channels[user_id].internalName) {
		var direction = "out";
		setAmiChannelMuted(s.asterisk.channels[user_id].internalName, value, direction, cb);
	} else {
		cb("PANIC - channel not found: " + user_id);
	}
};

exports.setMasterMuted = function (value, cb) {
	var direction = "out";
	setAmiChannelMuted(s.asterisk.conference.on_air, value, direction, cb);
};

exports.setMasterVolume = function (level, cb) {
	var direction = "TX";
		//-30 :: 20
		level = level / 5 - 16;
	setAmiChannelVolume(s.asterisk.conference.on_air, level, direction, cb);
};

exports.setHostMuted = function (value, cb) {
	var direction = "in";
	setAmiChannelMuted(s.asterisk.conference.on_air, value, direction, cb);
};

exports.setHostVolume = function (level, cb) {
	var direction = "RX";
		//-30 :: 20
		level = level / 5 - 16;
	setAmiChannelVolume(s.asterisk.conference.on_air, level, direction, cb);
};

exports.setChannelVolume = function (channel_id, level, cb) {
	if (s.asterisk.channels[channel_id] && s.asterisk.channels[channel_id].internalName) {
		var direction = "RX";
		//-30 :: 20
		level = level / 2 - 30;
		setAmiChannelVolume(s.asterisk.channels[channel_id].internalName, level, direction, cb);
	} else {
		cb("PANIC - channel not found: " + channel_id);
	}
};

exports.setUserVolume = function (channel_id, level, cb) {
	if (s.asterisk.channels[channel_id] && s.asterisk.channels[channel_id].internalName) {
		var direction = "TX";
		//-16 :: 9
		level = level / 4 - 16;
		setAmiChannelVolume(s.asterisk.channels[channel_id].internalName, level, direction, cb);
	} else {
		cb("PANIC - channel not found: " + channel_id);
	}
};

exports.setChanMode = function (channel_id, destination, cb) {
	if (s.asterisk.channels[channel_id] && s.asterisk.channels[channel_id].internalName) {
		if (astConf.virtual[destination]) {
			destination = astConf.virtual[destination];
		}
		amiRedirect(s.asterisk.channels[channel_id].internalName, destination, cb);
	} else {
		cb("PANIC - channel not found: " + channel_id);
	}
};

// channel_id and channel_id2 must be bridged for this to work
exports.setChanModes = function (channel_id, destination, channel_id2, destination2, cb) {
	if (astConf.virtual[destination]) {
		destination = astConf.virtual[destination];
	}
	if (astConf.virtual[destination2]) {
		destination2 = astConf.virtual[destination2];
	}
	console.log("exports.setChanModes", channel_id, destination, channel_id2, destination2);
	console.log("exports.setChanModes", s.asterisk.channels[channel_id].internalName, destination, s.asterisk.channels[channel_id2].internalName, destination2);
	amiRedirectBoth(s.asterisk.channels[channel_id].internalName, destination, s.asterisk.channels[channel_id2].internalName, destination2, cb);
};

exports.setChanFree = function (channel_id, cb) {
	amiHangup(s.asterisk.channels[channel_id].internalName, cb);
};

exports.setPhoneBookEntry = function (number, label, cb) {
	amiSimpleCommand('database put cidname ' + number + ' "' + label + '"', cb);
};

exports.setMasterRecording = function (value, cb) {
};

// debug: catch all AMI events
ami.on('managerevent', function(evt) {
	if (evt.event != "ConfbridgeTalking" && evt.event != 'Newexten' && evt.event != 'VarSet' && evt.event.indexOf("Dongle") !== 0 && evt.event.indexOf("RTCP") !== 0) {
		console.error(JSON.stringify(evt));
	}
	// else console.error(JSON.stringify(evt));
});

// debug: track interesting events
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

ami.on('softhanguprequest', function(evt) {
	console.error(JSON.stringify(evt));
});

ami.on('donglenewsms', function(evt) {
	console.error(JSON.stringify(evt));
});

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

/*
// deprecated, received after AMI action 'SIPpeers'
ami.on('peerentry', function(evt) {
//	{"event":"PeerEntry","actionid":"1447058788015","channeltype":"SIP","objectname":"701","chanobjecttype":"peer","ipaddress":"-none-","ipport":"0","dynamic":"yes","autoforcerport":"no","forcerport":"yes","autocomedia":"no","comedia":"yes","videosupport":"no","textsupport":"no","acl":"yes","status":"UNKNOWN","realtimedevice":"no","description":""}
//	{"event":"PeerEntry","actionid":"1447058788015","channeltype":"SIP","objectname":"702","chanobjecttype":"peer","ipaddress":"192.168.1.188","ipport":"40138","dynamic":"yes","autoforcerport":"no","forcerport":"no","autocomedia":"no","comedia":"no","videosupport":"no","textsupport":"no","acl":"yes","status":"OK (200 ms)","realtimedevice":"no","description":""}
});
*/

/*
// deprecated
ami.on('peerstatus', function(evt) {
// received after AMI action 'SIPpeerstatus'
//	{"event":"PeerStatus","privilege":"System","channeltype":"SIP","peer":"SIP/701","peerstatus":"Unknown","actionid":"1447147680674"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Reachable","time":"25"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Lagged","time":"148"}

// received on status change
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Unreachable","time":"-1"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Registered","address":"192.168.1.188:47441"}
//	{"event":"PeerStatus","privilege":"system,all","channeltype":"SIP","peer":"SIP/702","peerstatus":"Unregistered","cause":"Expired"}

	var sipPeer = evt.peer.substring(4);
	if (astConf.hosts.indexOf(sipPeer) !== -1 || astConf.operators.indexOf(sipPeer) !== -1) {
		var peerStatus = evt.peerstatus.toLowerCase();
		switch (peerStatus) {
			case 'reachable':
			case 'registered':
				break;
			case 'unregistered':
			case 'unknown':
				break;
		}
	}
	console.error(JSON.stringify(evt));
});
*/

