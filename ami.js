var appConf = require("./etc/app.json");
var astConf = require("./etc/asterisk.json");
var logger = new (require("./logger"))(__filename);
var amiConf = astConf.ami;

var myLib = require("./myLib");
var engineApi = require("./engineApi");
var s = require("./localStorage");

var prefixRegExp = new RegExp('^\\' + appConf.country_prefix);

var ami = new require('asterisk-manager')(amiConf.port, amiConf.host, amiConf.username, amiConf.password, true);
// https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AMI+Events
// https://wiki.asterisk.org/wiki/display/AST/Asterisk+13+AMI+Actions
ami.keepConnected();

	s.asterisk = {
		sms_in: new Map(), // map for storing multipart incoming sms
		channels: {},
		conference: {
//			input: null,
//			output: null,
	//		members: {},
			on_air: null
		},
		master: {
		}
	};

var sms_out_pending = new Map(); // map for storing outgoing sms while waiting for confirmation
var dongleInfoUpdate;

var eventCallbacks = {
	'initialized': function () {}
};

exports.on = function (event, callback) {
	if (eventCallbacks.hasOwnProperty(event) && 'function' === typeof callback) {
		eventCallbacks[event] = callback;
	} else {
		myLib.consoleLog('panic', 'ami::eventCallbacks', [event, callback]);
	}
};


// start initialization sequence
// this code is executed when our app (re)connects to Asterisk
ami.on('fullybooted', function(evt) {
	myLib.consoleLog('log', "init", "Asterisk interface ready!");
	//clear previous channel properties
	s.ui.mixer.channels = {};
	s.asterisk.channels = {};

	if (astConf.dongles && Object.keys(astConf.dongles).length > 0) {
		// we want all configured dongle channels to be present
		for (var dongleName in astConf.dongles) {
			//s.ui.mixer.channels[dongleName] = mixerLib.createChannel('dongle', astConf.dongles[dongleName].number);
			engineApi.channelUpdate(dongleName, {
				type: 'dongle',
				label: astConf.dongles[dongleName].label
			});
			s.asterisk.channels[dongleName] = {};
		}

		//clear previous dongle update job
		if (dongleInfoUpdate) {
			clearInterval(dongleInfoUpdate);
			dongleInfoUpdate = null;
		}

		ami.action({
			action: "DongleShowDevices"
		}, function(err, res) {
			//{"response":"Success","actionid":"1446811737040","eventlist":"start","message":"Device status list will follow"}
			if (!err && res.response === 'Success') { // 'dongledeviceentry' events will follow, ends with 'DongleShowDevicesComplete'
				myLib.consoleLog('log', "init", 'Dongle driver is talking');
				if (astConf.dongleInfoInterval) {
					dongleInfoUpdate = setInterval(() => {
						ami.action({ action: "DongleShowDevices" });
					}, astConf.dongleInfoInterval * 1000);
				}
			} else {
				myLib.consoleLog('error', 'init Dongle', JSON.stringify(err) + " " + JSON.stringify(res));
			}
		});
	}

	ami.action({ // list SIP and other relevant peers present at time of connection
		action: "DeviceStateList"
	}, function(err, res) {  // 'DeviceStateChange' events will follow, ends with 'DeviceStateListComplete'
		// this must succeed
	});
});

// shoud happen only on init
ami.on('devicestatelistcomplete', function(evt) {
	ami.action({ // list active channels at time of connection
		action: "CoreShowChannels"
	}, function(err, res) { // 'coreshowchannel' events will follow, ends with 'CoreShowChannelsComplete'
		// this must succeed
	});

	ami.action({
		action: "ConfbridgeList",
		conference: astConf.virtual.master.split('@')[0]
	}, function(err, res) {
		// { response: 'Success', actionid: '1447157967259', eventlist: 'start', message: 'Confbridge user list will follow' }
		if (!err && res.response === 'Success') { // 'confbridgelist' events will follow
			myLib.consoleLog('debug', "ConfbridgeList", res);
		} else {
			myLib.consoleLog('error', "ConfbridgeList", JSON.stringify(res));
			if (astConf.console && (astConf.console.in || astConf.console.out)) {
				ami.action({
//					action: "ModuleCheck",
//					module: 'chan_alsa'
					action: "Command",
					command: 'core show channeltype console'
				}, function(err, res) {
					myLib.consoleLog('debug', "ModuleCheck", [err, res]);
					if (err) {
						myLib.consoleLog('error', "ModuleCheck", err);
						s.ui.mixer.master.in = null;
						s.ui.mixer.master.out = null;
					}
					eventCallbacks.initialized();
				});
			} else {
				myLib.consoleLog('warning', "console channel disabled", "audio input/output will not work");
				eventCallbacks.initialized();
			}
		}
	});
});

ami.on('dongledeviceentry', function(evt) {
//	{"event":"dongledeviceentry","actionid":"1446811737040","device":"airtel1","audiosetting":"","datasetting":"","imeisetting":"354369047238739","imsisetting":"","channellanguage":"mk","context":"from-trunk","exten":"+1234567890","group":"0","rxgain":"4","txgain":"1","u2diag":"0","usecallingpres":"yes","defaultcallingpres":"presentation allowed, passed screen","autodeletesms":"yes","disablesms":"no","resetdongle":"yes","smspdu":"yes","callwaitingsetting":"disabled","dtmf":"relax","minimaldtmfgap":"45","minimaldtmfduration":"80","minimaldtmfinterval":"200","state":"free","audiostate":"/dev/ttyusb4","datastate":"/dev/ttyusb5","voice":"yes","sms":"yes","manufacturer":"huawei","model":"e1731","firmware":"11.126.16.04.284","imeistate":"354369047238739","imsistate":"640050939309334","gsmregistrationstatus":"registered, home network","rssi":"11, -91 dbm","mode":"wcdma","submode":"wcdma","providername":"celtel","locationareacode":"50","cellid":"bbe887e","subscribernumber":"+255689514544","smsservicecenter":"+255780000004","useucs2encoding":"yes","ussduse7bitencoding":"no","ussduseucs2decoding":"yes","tasksinqueue":"0","commandsinqueue":"0","callwaitingstate":"disabled","currentdevicestate":"start","desireddevicestate":"start","callschannels":"0","active":"0","held":"0","dialing":"0","alerting":"0","incoming":"0","waiting":"0","releasing":"0","initializing":"0"}
//	{"event":"dongledeviceentry","actionid":"1448708202036","device":"airtel2","audiosetting":"","datasetting":"","imeisetting":"354369047217469","imsisetting":"","channellanguage":"mk","context":"from-trunk","exten":"+1234567890","group":"0","rxgain":"4","txgain":"1","u2diag":"0","usecallingpres":"yes","defaultcallingpres":"presentation allowed, passed screen","autodeletesms":"yes","disablesms":"no","resetdongle":"yes","smspdu":"yes","callwaitingsetting":"disabled","dtmf":"relax","minimaldtmfgap":"45","minimaldtmfduration":"80","minimaldtmfinterval":"200","state":"gsm not registered","audiostate":"/dev/ttyusb1","datastate":"/dev/ttyusb2","voice":"yes","sms":"yes","manufacturer":"huawei","model":"e1731","firmware":"11.126.16.04.284","imeistate":"354369047217469","imsistate":"640050938039425","gsmregistrationstatus":"registration denied","rssi":"15, -83 dbm","mode":"wcdma","submode":"wcdma","providername":"none","locationareacode":"50","cellid":"bbe8881","subscribernumber":"+255788333330","smsservicecenter":"+255780000004","useucs2encoding":"yes","ussduse7bitencoding":"no","ussduseucs2decoding":"yes","tasksinqueue":"0","commandsinqueue":"0","callwaitingstate":"disabled","currentdevicestate":"start","desireddevicestate":"start","callschannels":"0","active":"0","held":"0","dialing":"0","alerting":"0","incoming":"0","waiting":"0","releasing":"0","initializing":"0"}

	if (astConf.dongles[evt.device] ) { // check if device is configured in fessbox
		if (!s.ui.mixer.channels[evt.device]) { // sanity check
			myLib.consoleLog('panic', 'ami::on-dongledeviceentry', 'channel not found in mixer', evt.device);
		} else {
			var connectionInfo = {
				rssi: evt.rssi,
				mode: evt.mode,
				submode: evt.submode,
				provider: astConf.dongles[evt.device].network ? astConf.dongles[evt.device].network : evt.providername,
			};

			//if number is configured, only update connection info, else assume this is initialization
			if (!s.ui.mixer.channels[evt.device].number) {
				s.ui.mixer.channels[evt.device].error = null;
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
						myLib.consoleLog('log', "ami::on-dongledeviceentry", 'dongle not registered, reseting', evt.device);
						ami.action({
							action: "DongleReset",
							device: evt.device
						}, function(err, res) {
							if (err) {
								myLib.consoleLog('error', "ami::on-dongledeviceentry", "DongleReset", evt.device);
							}
						});
					case 'not connected':
					case 'not initialized':
					default:
						myLib.consoleLog('error', "ami::on-dongledeviceentry", 'dongleState', dongleState);
						s.ui.mixer.channels[evt.device].error = dongleState;
				}

				if (dongleState !== 'not connected') {
					if (evt.subscribernumber === 'Unknown') {
						// todo: send email to admin?
						myLib.consoleLog('error', "sim number not configured", evt.device);
					} else {
						if (!s.ui.mixer.channels[evt.device].label) {
							s.ui.mixer.channels[evt.device].label = evt.subscribernumber.replace(prefixRegExp, '0');
						}
					}
					s.ui.mixer.channels[evt.device].number = evt.subscribernumber;
				}

				// delete stored sms from modem
				switch (dongleState) {
					case 'free':
					case 'ring':
					case 'dialing':
					case 'incoming':
					case 'outgoing':
						deleteStoredSms(evt.device);
				}
			}
			engineApi.channelUpdate(evt.device, { connection: connectionInfo });
		}
	}
	//console.error(JSON.stringify(evt));
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
						engineApi.channelUpdate(channelInfo[1], {
							mode: 'ring',
							direction: 'incoming',
							timestamp: Date.now() - myLib.msecDuration(evt.duration),
							contact: {
								number: evt.calleridnum.replace(prefixRegExp, '0'),
								name: evt.calleridname
							}
						});
						break;
					case 'up':
						s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
						if (evt.application === 'ConfBridge') {
							var appData = evt.applicationdata.split(',', 4);
							/* todo: this should be done here instead of in 'confbridgelist' handler
							if (appData[0] === astConf.virtual.master) {
								api.channelUpdate({
									mode: 'master',
									direction: 'incoming',
									timestamp: Date.now() - myLib.msecDuration(evt.duration),
									contact: {
										number: evt.calleridnum.replace(prefixRegExp, '0'),
										name: evt.calleridname
									}
								});
							}
							*/
						}
						break;
				}
			}
//		case 'Local':
		case 'SIP':
			if (astConf.operators.indexOf(channelInfo[1]) !== -1) {
					console.error('internal name set', evt.channel);
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
	if (evt.conference == astConf.virtual.master.split('@')[0]) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);
		if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.on_air = evt.channel;
		} else {
			//console.error(s.ui.mixer.channels, channelInfo[1]);
			//s.asterisk.conference.members[channelInfo[1]] = evt.channel;
			s.ui.mixer.channels[channelInfo[1]].mode = 'master';
			s.ui.mixer.channels[channelInfo[1]].muted = evt.muted === "No" ? false : true;
		}
	}
});

ami.on('confbridgelistcomplete', function(evt) {
	eventCallbacks.initialized();
});
// end initialization code

ami.on('devicestatechange', function(evt) {
//	{"event":"DeviceStateChange","privilege":"call,all","device":"SIP/702","state":"NOT_INUSE" | "INUSE" | "UNAVAILABLE"}
//	console.error(JSON.stringify(evt));
	var channelInfo = evt.device.split(/[\/-]/, 2);
	// check if extension is configured in fessbox
	if (channelInfo[0] === 'SIP' && astConf.operators.indexOf(channelInfo[1]) !== -1) {
		switch (evt.state) {
			case 'UNAVAILABLE':
				if (s.ui.mixer.channels[channelInfo[1]] && s.ui.mixer.channels[channelInfo[1]].mode !== 'defunct') {
					// todo: channels should have 'allways visible' property. If set, mode should be updated to 'defunct' instead of removing channel
					s.saveChannel(channelInfo[1]);
					s.saveOperator(channelInfo[1]);
					//api.channelUpdate(channelInfo[1], null);
					engineApi.channelUpdate(channelInfo[1], { mode: 'defunct' });
				}
				break;
			case 'NOT_INUSE':
				if (!s.ui.mixer.channels[channelInfo[1]]) {
					//s.loadChannel(channelInfo[1]);
					//s.ui.mixer.channels[channelInfo[1]].type = 'sip';
					//s.ui.mixer.channels[channelInfo[1]].mode = 'free';
					//s.ui.mixer.channels[channelInfo[1]].direction = 'operator';
					engineApi.channelUpdate(channelInfo[1], {
						type: 'sip',
						mode: 'free',
						direction: 'operator'
					});
					s.loadOperator(channelInfo[1]);
				} else if (s.ui.mixer.channels[channelInfo[1]].mode !== 'free') {
					engineApi.channelUpdate(channelInfo[1], { mode: 'free' });
				}
				break;
			case 'INUSE':
				if (!s.ui.mixer.channels[channelInfo[1]]) {
					//s.loadChannel(channelInfo[1]);
					//s.ui.mixer.channels[channelInfo[1]].type = 'sip';
					//s.ui.mixer.channels[channelInfo[1]].mode = 'free';
					//s.ui.mixer.channels[channelInfo[1]].direction = 'operator';
					engineApi.channelUpdate(channelInfo[1], {
						type: 'sip',
						mode: 'master',
						direction: 'operator'
					});
					s.loadOperator(channelInfo[1]);
				}
				break;
		}
	}
});

ami.on('donglecallstatechange', function(evt) {
//	{"event":"DongleCallStateChange","privilege":"call,all","device":"airtel2","callidx":"1","newstate":"released"}
//	 {"event":"DongleCallStateChange","privilege":"call,all","device":"airtel1","callidx":"1","newstate":"active"}
//	console.error(JSON.stringify(evt));
});

ami.on('donglenewsmsbase64', function(evt) {
//	console.error(JSON.stringify(evt));
	// check if dongle is configured in fessbox
	if (astConf.dongles[evt.device]) {
		//delete internal sms storage on every XX received messages
		if (++s.asterisk.channels[evt.device].sms_count > 25) {
			deleteStoredSms(evt.device);
		}
		//log debug info to help find out why modem sms storage gets full
		if (s.asterisk.channels[evt.device].sms_count % 11 === 0) {
			amiSimpleCommand(["dongle cmd", evt.device, "AT+CPMS?"].join(' '));
		}

		var timeout = 19900; // number of mili-seconds to wait for next part of sms
		var sms_max_length = 204; // 204 is the length of the base64 encoded 160 chars
		var inboxUpdateMultipart = function () {
			engineApi.inboxUpdate(s.asterisk.sms_in.get(evt.from).data);
			s.asterisk.sms_in.delete(evt.from);
		};

		// update previos part of multipart sms if exists
		if (s.asterisk.sms_in.has(evt.from)) {
			clearTimeout(s.asterisk.sms_in.get(evt.from).timeout);
			s.asterisk.sms_in.get(evt.from).data.content += new Buffer(evt.message, 'base64').toString("utf8");
			s.asterisk.sms_in.get(evt.from).data.timestamp = Date.now();
			//check if message has potentialy more parts
			if (evt.message.length === sms_max_length && evt.message[sms_max_length - 1] !== '=') {
				s.asterisk.sms_in.get(evt.from).timeout = setTimeout(inboxUpdateMultipart, timeout);
			} else {
				inboxUpdateMultipart();
			}
		} else {
			var data = {
				type: 'sms_in',
				timestamp: Date.now(),
				channel_id: evt.device,
				endpoint: evt.from.replace(prefixRegExp, '0'),
				content: new Buffer(evt.message, 'base64').toString("utf8")
			};

			if (evt.message.length === sms_max_length && evt.message[sms_max_length - 1] !== '=') {
				s.asterisk.sms_in.set(evt.from, {
					data: data,
					timeout: setTimeout(inboxUpdateMultipart, timeout)
				});
			} else {
				engineApi.inboxUpdate(data);
			}
		}

		// alternative solution for multipart is for all messages to send update to UI right away,
		// and if another one comes before timeout, update the previus msg. This can be handled in
		// engineApi, because we'll need to know the uuid of the previous message.
	}
});

// used to signal incoming dongle call
//todo: get user info via addressBook api call on newchannel event instead of using this event
ami.on('newcallerid', function(evt) {
//11	{"event":"NewCallerid","privilege":"call,all","channel":"Dongle/airtel2-0100000004","calleridnum":"+255688755855","calleridname":"airtel2-xxx","uniqueid":"1449483797.31","cid-callingpres":"0 (Presentation Allowed, Not Screened)"}
//13	{"event":"NewCallerid","privilege":"call,all","channel":"Dongle/airtel1-0100000008","channelstate":"0","channelstatedesc":"Down","calleridnum":"075562837","calleridname":"<unknown>","connectedlinenum":"+255689514544","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"from-trunk","exten":"075562837","priority":"1","uniqueid":"1492837705.458","linkedid":"1492837705.452","cid-callingpres":"0 (Presentation Allowed, Not Screened)"}
/*
{ event: 'NewCallerid',
  privilege: 'call,all',
  channel: 'Dongle/vip1-010000000e',
  channelstate: '4',
  channelstatedesc: 'Ring',
  calleridnum: '+38975562837',
  calleridname: 'dam-mob2',
  connectedlinenum: '<unknown>',
  connectedlinename: '<unknown>',
  language: 'en',
  accountcode: '',
  context: 'cidlookup',
  exten: 'cidlookup_5',
  priority: '1',
  uniqueid: '1522651325.994',
  linkedid: '1522651325.994',
  'cid-callingpres': '0 (Presentation Allowed, Not Screened)' }*/

	let [chanType, chanName] = evt.channel.split(/[\/-]/, 3);
	if (chanType === 'Dongle' && s.ui.mixer.channels[chanName]) {
		if (evt.channelstatedesc === 'Ring') {
			s.asterisk.channels[chanName].internalName = evt.channel;
			engineApi.channelUpdate(chanName, {
//				type: chanType.toLowerCase(), // 'dongle'
				mode: evt.channelstatedesc.toLowerCase(), // 'ring'
				direction: 'incoming',
				timestamp: Date.now(),
				contact: {
					number: evt.calleridnum.replace(prefixRegExp, '0'),
					name:  evt.calleridname
				}
			});
			//console.error("xxx", chanName, s.ui.mixer.channels);
			console.error("setting initial chan volume", s.ui.mixer.channels[chanName].level);
			//setAmiChannelVolume(evt.channel, s.ui.mixer.channels[chanName].level, 'RX', function() {});
			exports.setChannelVolume(chanName, s.ui.mixer.channels[chanName].level, function() {});
			if (s.ui.mixer.channels[chanName].muted) {
				setAmiChannelMuted(evt.channel, true, 'in', function() {});
			}
		}
/*
		if (!s.ui.mixer.channels[channelInfo[1]].contact) {
			engineApi.channelUpdate(channelInfo[1], { contact: {
				name: evt.calleridname,
				number: evt.calleridnum.replace(prefixRegExp, '0'),
			}});
		} else if (s.ui.mixer.channels[channelInfo[1]].contact.name !== evt.calleridname) {
			engineApi.channelUpdate(channelInfo[1], { contact: {
				name: evt.calleridname,
			}});
		}
*/
	}
});

// used for SIP ringing notification, both incoming and outgoing
ami.on('newstate', function(evt) {
/*
{ event: 'Newstate',
  privilege: 'call,all',
  channel: 'SIP/389002-00000003',
  channelstate: '4',
  channelstatedesc: 'Ring',
  calleridnum: '222',
  calleridname: 'Damjan Janevski',
  connectedlinenum: '<unknown>',
  connectedlinename: '<unknown>',
  language: 'en',
  accountcode: '',
  context: 'from-trunk',
  exten: '389002',
  priority: '1',
  uniqueid: '1522262483.112',
  linkedid: '1522262483.112' }*/

	let [chanType, chanName] = evt.channel.split(/[\/-]/, 3);
	if (chanType === 'SIP' && astConf.extensions.includes(chanName) && ['Ring', 'Ringing'].includes(evt.channelstatedesc)) {
		let channel_id = [chanName, evt.calleridnum ? evt.calleridnum : 'unknown'].join('_');
		s.asterisk.channels[channel_id] = { internalName: evt.channel };
		//engineApi.channelCreate(channel_id, {...});
		engineApi.channelUpdate(channel_id, {
			type: chanType.toLowerCase(),
			number: chanName,
		//	level: 67,
			direction: evt.channelstatedesc === 'Ringing' ? 'outgoing' : 'incoming',
			label: 'Extension',
			mode: 'ring',
		//	muted: false,
		//	timestamp: Date.now(),
		//	autoanswer: null,
			contact: {
				number: evt.calleridnum,
				name:  evt.calleridname,
			},
		//	recording: false,
		});
	}
});

ami.on('donglestatus', function(evt) {
// evt.status: "Free" | "Disconnect" | "Connect" | "Initialize" | "Used" | "Unregister" | "Register"

	if (s.asterisk.channels[evt.device] && s.ui.mixer.channels[evt.device]) {
		switch (evt.status) {
			//case 'Free':
			case 'Initialize':
				s.asterisk.channels[evt.device].internalName = null;
				engineApi.channelUpdate(evt.device, { mode: 'free' });
/*				if (s.ui.mixer.channels[evt.device].mode !== 'free') {
					api.changeMode(evt.device, 'free');
				}
*/				break;
			case 'Disconnect':
				s.asterisk.channels[evt.device].internalName = null;
				engineApi.channelUpdate(evt.device, { mode: 'defunct' });
/*				if (s.ui.mixer.channels[evt.device].mode !== 'defunct') {
					s.asterisk.channels[evt.device].internalName = null;
					api.changeMode(evt.device, 'defunct');
				}
*/				break;
		}
	}
	// debug
//	if (evt.status != 'Register' && evt.status != 'Unregister') {
		console.error(JSON.stringify(evt));
//	}
});

// asterisk 13 event
ami.on('musiconholdstart', function(evt) {
//	{"event":"MusicOnHoldStart","privilege":"call,all","channel":"Dongle/airtel1-0100000003","channelstate":"6","channelstatedesc":"Up","calleridnum":"<unknown>","calleridname":"airtel1","connectedlinenum":"<unknown>","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"from-internal","exten":"196","priority":"2","uniqueid":"1458909247.56","linkedid":"1458909247.56","class":"default"}
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	// temporary fix: change  mode to on-hold only when explicitly redirected to on_hold extension
	if (s.asterisk.channels[channelInfo[1]] && evt.exten === astConf.virtual.on_hold) {
		engineApi.channelUpdate(channelInfo[1], { mode: 'on_hold' });
	} else if (channelInfo[0] === 'ALSA') {
		consoleHangup();
		s.asterisk.conference.on_air = null;
	}
});

/*
// asterisk 11 event, implementation not up to date. 
ami.on('musiconhold', function(evt) {
//	{"event":"MusicOnHold","privilege":"call,all","state":"Stop","channel":"ALSA/hw:0,0","uniqueid":"1448348233.0"}
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	// temporary fix: change  mode to on-hold only when explicitly redirected to on_hold extension
	if (s.asterisk.channels[channelInfo[1]] && evt.state === "Start" && evt.exten === astConf.virtual.on_hold) {
		engineApi.channelUpdate(channelInfo[1], { mode: 'on_hold' });
	}
});
*/

// signal ringing when dialing out via dongle. should be moved on originate success
ami.on('dialbegin', function(evt) {
//	{"event":"DialBegin","privilege":"call,all","channel":"Local/2663@ext-meetme-00000005;1","channelstate":"6","channelstatedesc":"Up","calleridnum":"+255689514544","calleridname":"<unknown>","connectedlinenum":"<unknown>","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"macro-dialout-trunk","exten":"s","priority":"30","uniqueid":"1463896754.63","linkedid":"1463896754.63","destchannel":"Dongle/airtel1-0100000001","destchannelstate":"0","destchannelstatedesc":"Down","destcalleridnum":"0687754487","destcalleridname":"<unknown>","destconnectedlinenum":"+255689514544","destconnectedlinename":"<unknown>","destlanguage":"en","destaccountcode":"","destcontext":"from-trunk","destexten":"0687754487","destpriority":"1","destuniqueid":"1463896754.69","destlinkedid":"1463896754.63","dialstring":"airtel1/0687754487"}
	let [chanType, chanName] = evt.destchannel.split(/[\/-]/, 3);
	if (chanType === 'Dongle' && s.asterisk.channels[chanName]) {
		s.asterisk.channels[chanName].internalName = evt.destchannel;
		let channel = s.ui.mixer.channels[chanName];
		let callerId = evt.dialstring.split('/')[1].replace(prefixRegExp, '0')
		let update = {
			mode: 'ring',
			direction: 'outgoing',
		};
		if (!channel.contact || channel.contact.number !== callerId) {
			Object.assign(update, { contact: {
				number: callerId,
				name: evt.destcalleridname !== "<unknown>" ? evt.destcalleridname : null
			}});
		} else if (evt.destcalleridname !== "<unknown>" && evt.destcalleridname !== channel.contact.name) {
			Object.assign(update, { contact: {
				number: callerId,
				name: evt.destcalleridname,
			}});
		}
		engineApi.channelUpdate(chanName, update);
	}
});

// this is triggered when hangup is not initiated by operator
ami.on('hanguprequest', function(evt) {
//	{"event":"HangupRequest","privilege":"call,all","channel":"Dongle/airtel1-0100000011","channelstate":"6","channelstatedesc":"Up","calleridnum":"+255687754487","calleridname":"airtel1 hello","connectedlinenum":"<unknown>","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"from-internal","exten":"196","priority":"2","uniqueid":"1464214922.165","linkedid":"1464214922.165"}
//	{"event":"Hangup","privilege":"call,all","channel":"Dongle/airtel1-0100000006","uniqueid":"1448369795.17","calleridnum":"+255687754487","calleridname":"airtel1","connectedlinenum":"707","connectedlinename":"host galaxy tab","accountcode":"","cause":"17","cause-txt":"Operator busy"}
	//var channelInfo = evt.channel.split(/[\/-]/, 3);
	//if (channelInfo[0] !== 'Dongle' && s.asterisk.channels[channelInfo[1]]) {
	//	s.asterisk.channels[channelInfo[1]].internalName = null;
	//	engineApi.channelUpdate(channelInfo[1], { mode: 'free' });
	//}

	let [chanType, chanName] = evt.channel.split(/[\/-]/, 3);
	if (chanType === 'Dongle' && s.asterisk.channels[chanName]) {
		s.asterisk.channels[chanName].internalName = null;
		engineApi.channelUpdate(chanName, { mode: 'free' });
	} else
	// hanging up external sip call
	if (chanType === 'SIP' && astConf.extensions.includes(chanName)) {
		let channel_id = [chanName, evt.calleridnum ? evt.calleridnum : 'unknown'].join('_');
		s.asterisk.channels[channel_id] = null;
		engineApi.channelUpdate(channel_id, { mode: 'free' });
		//engineApi.channelDestroy(channel_id);
	}
});

ami.on("confbridgestart", function(evt) {
//	{"event":"ConfbridgeStart","privilege":"call,all","conference":"2663","bridgeuniqueid":"511f57cb-9d48-422e-94e3-4ef85974272d","bridgetype":"base","bridgetechnology":"softmix","bridgecreator":"ConfBridge","bridgename":"2663","bridgenumchannels":"0"}
	if (evt.conference === astConf.virtual.master.split('@')[0]) {
		if (evt.bridgenumchannels == "0") {
			consoleToMaster();
		}

		console.error("ConfbridgeStart", evt.bridgenumchannels);
	}
});

ami.on('confbridgejoin', function(evt) {
//	{"event":"ConfbridgeJoin","privilege":"call,all","channel":"SIP/703-00000000","uniqueid":"1444910756.0","conference":"2663","calleridnum":"703","calleridname":"Damjan Laptop"}
//	{"event":"ConfbridgeJoin","privilege":"call,all","conference":"2663","bridgeuniqueid":"e245cfd0-8b0b-45ca-98e1-7e45e1f3aea4","bridgetype":"base","bridgetechnology":"softmix","bridgecreator":"ConfBridge","bridgename":"2663","bridgenumchannels":"0","channel":"Dongle/airtel1-0100000003","channelstate":"6","channelstatedesc":"Up","calleridnum":"+38975562837","calleridname":"airtel1","connectedlinenum":"<unknown>","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"from-internal","exten":"STARTMEETME","priority":"5","uniqueid":"1471239540.45","linkedid":"1471239540.45","admin":"No"}
	if (evt.conference === astConf.virtual.master.split('@')[0]) {
		var channelInfo = evt.channel.split(/[\/-]/, 3);

		if (s.asterisk.channels[channelInfo[1]]) {
/* moved to "confbridgestart" event
			if (evt.bridgenumchannels == "0") {
				consoleToMaster();
			}
*/
			s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
			engineApi.channelUpdate(channelInfo[1], { mode: 'master' });
		} else if (channelInfo[0] === 'ALSA') {
			s.asterisk.conference.on_air = evt.channel;
			if (s.ui.mixer.master.in && typeof s.ui.mixer.master.in.muted === 'boolean') {
				setAmiChannelMuted(evt.channel, s.ui.mixer.master.in.muted, 'in', function() {});
			}
			if (s.ui.mixer.master.out && typeof s.ui.mixer.master.out.muted === 'boolean') {
				setAmiChannelMuted(evt.channel, s.ui.mixer.master.out.muted, 'out', function() {});
			}
			//eventCallbacks.initialized();
			/*
					//setAmiChannelVolume(evt.channel, s.ui.mixer.channels[channelInfo[1]].level, 'RX', function() {});
					exports.setChannelVolume(channelInfo[1], s.ui.mixer.channels[channelInfo[1]].level, function() {});
					//setAmiChannelVolume(evt.channel, s.ui.operators[channelInfo[1]].level, 'TX', function() {});
					exports.setOperatorVolume(channelInfo[1], s.ui.operators[channelInfo[1]].level, function() {});
					if (s.ui.mixer.channels[channelInfo[1]].muted) {
						setAmiChannelMuted(evt.channel, true, 'in', function() {});
					}
					if (s.ui.operators[channelInfo[1]].muted) {
						setAmiChannelMuted(evt.channel, true, 'out', function() {});
					}
			*/
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

// handling remote answer in special case when dialing out with originateLocal
ami.on('dialend', function (evt) {
//	{"event":"DialEnd","privilege":"call,all","channel":"Local/2663@ext-meetme-00000005;1","channelstate":"6","channelstatedesc":"Up","calleridnum":"+255689514544","calleridname":"<unknown>","connectedlinenum":"<unknown>","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"macro-dialout-trunk","exten":"s","priority":"30","uniqueid":"1465851477.78","linkedid":"1465851477.78","destchannel":"Dongle/airtel1-0100000004","destchannelstate":"6","destchannelstatedesc":"Up","destcalleridnum":"0687754487","destcalleridname":"<unknown>","destconnectedlinenum":"+255689514544","destconnectedlinename":"<unknown>","destlanguage":"en","destaccountcode":"","destcontext":"from-trunk","destexten":"","destpriority":"1","destuniqueid":"1465851477.84","destlinkedid":"1465851477.78","dialstatus":"ANSWER"}
/*
{ event: 'DialEnd',
  privilege: 'call,all',
  channel: 'Local/2663@ext-meetme-0000002e;1',
  channelstate: '6',
  channelstatedesc: 'Up',
  calleridnum: '<unknown>',
  calleridname: '<unknown>',
  connectedlinenum: '222',
  connectedlinename: 'Damjan Janevski',
  language: 'en',
  accountcode: '',
  context: 'ext-meetme',
  exten: '2663',
  priority: '1',
  uniqueid: '1522645419.664',
  linkedid: '1522645419.664',
  destchannel: 'SIP/389002-0000000e',
  destchannelstate: '6',
  destchannelstatedesc: 'Up',
  destcalleridnum: '222',
  destcalleridname: 'Damjan Janevski',
  destconnectedlinenum: '<unknown>',
  destconnectedlinename: '<unknown>',
  destlanguage: 'en',
  destaccountcode: '',
  destcontext: 'from-trunk',
  destexten: '',
  destpriority: '1',
  destuniqueid: '1522645419.670',
  destlinkedid: '1522645419.664',
  dialstatus: 'ANSWER' }*/

	if (evt.dialstatus === "ANSWER") {
		let [chanType, chanName] = evt.destchannel.split(/[\/-]/, 3);
		if (chanType === 'Dongle' && s.ui.mixer.channels[chanName]) {
			//var localChannel = evt.channel.split(/[\/@]/, 3);
			//if (localChannel[1] === astConf.virtual.master) {
			if (evt.channel.indexOf(astConf.virtual.master) !== -1) {
				engineApi.channelUpdate(chanName, { mode: 'master' });
			}
		} else if (chanType === 'SIP' && astConf.extensions.includes(chanName)) {
			let channel_id = [chanName, evt.destcalleridnum ? evt.destcalleridnum : 'unknown'].join('_');
			if (evt.channel.indexOf(astConf.virtual.master) !== -1) {
				engineApi.channelUpdate(channel_id, { mode: 'master' });
			}
		}
	}
});

ami.on('newchannel', function(evt) {
//{"event":"Newchannel","privilege":"call,all","channel":"SIP/703-00000000","channelstate":"0","channelstatedesc":"Down","calleridnum":"703","calleridname":"Damjan Laptop","accountcode":"","exten":"2663","context":"from-internal","uniqueid":"1445360462.0"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-input","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.1"}
//{"event":"Newchannel","privilege":"call,all","channel":"Bridge/0xd5656c-output","channelstate":"6","channelstatedesc":"Up","calleridnum":"","calleridname":"","accountcode":"","exten":"","context":"","uniqueid":"1445360467.2"}
//{"event":"Newchannel","privilege":"call,all","channel":"Dongle/airtel2-0100000000","channelstate":"4","channelstatedesc":"Ring","calleridnum":"+255682120818","calleridname":"airtel2","accountcode":"","exten":"+255788333330","context":"from-trunk","uniqueid":"1446819272.2"}
//{"event":"Newchannel","privilege":"call,all","channel":"SIP/389002-00000000","channelstate":"0","channelstatedesc":"Down","calleridnum":"222","calleridname":"Damjan Janevski","connectedlinenum":"<unknown>","connectedlinename":"<unknown>","language":"en","accountcode":"","context":"from-trunk","exten":"389002","priority":"1","uniqueid":"1522260256.92","linkedid":"1522260256.92"}
/*{ event: 'Newchannel',
  privilege: 'call,all',
  channel: 'SIP/389002-0000000d',
  channelstate: '0',
  channelstatedesc: 'Down',
  calleridnum: '<unknown>',
  calleridname: '<unknown>',
  connectedlinenum: '<unknown>',
  connectedlinename: '<unknown>',
  language: 'en',
  accountcode: '',
  context: 'from-trunk',
  exten: 's',
  priority: '1',
  uniqueid: '1522643513.571',
  linkedid: '1522643513.566' }*/

	//console.error(JSON.stringify(evt, null, 4));
	var channelInfo = evt.channel.split(/[\/-]/, 3);
	var newChannel = {};
	switch (channelInfo[0]) {
		case 'Dongle':
/*			if (s.ui.mixer.channels[channelInfo[1]]) {
				//myLib.consoleLog('debug', "New dongle channel internal name", [channelInfo[1], evt.channel]);
				s.asterisk.channels[channelInfo[1]].internalName = evt.channel;
				switch (evt.channelstatedesc) {
					case 'Ring':
						engineApi.channelUpdate(channelInfo[1], {
//							type: channelInfo[0].toLowerCase(),
							mode: 'ring',
							direction: 'incoming',
							timestamp: Date.now(),
							contact: {
								number: evt.calleridnum.replace(prefixRegExp, '0'),
								name:  evt.calleridname
							}
						});
						//console.error("xxx", channelInfo[1], s.ui.mixer.channels);
						console.error("setting initial chan volume", s.ui.mixer.channels[channelInfo[1]].level);
						//setAmiChannelVolume(evt.channel, s.ui.mixer.channels[channelInfo[1]].level, 'RX', function() {});
						exports.setChannelVolume(channelInfo[1], s.ui.mixer.channels[channelInfo[1]].level, function() {});
						if (s.ui.mixer.channels[channelInfo[1]].muted) {
							setAmiChannelMuted(evt.channel, true, 'in', function() {});
						}
						break;
				}
			}*/

			break;
/*		case 'SIP':
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
					//setAmiChannelVolume(evt.channel, s.ui.operators[channelInfo[1]].level, 'TX', function() {});
					exports.setOperatorVolume(channelInfo[1], s.ui.operators[channelInfo[1]].level, function() {});
					if (s.ui.mixer.channels[channelInfo[1]].muted) {
						setAmiChannelMuted(evt.channel, true, 'in', function() {});
					}
					if (s.ui.operators[channelInfo[1]].muted) {
						setAmiChannelMuted(evt.channel, true, 'out', function() {});
					}
	//				s.ui.mixer.hosts[channelInfo[1]] = s.loadHostSettings(channelInfo[1]);
	//				initializeHost(channelInfo[1]);
					
				}
//			}
			//s.channels[evt.calleridnum] = evt;
			break;*/
		default:
	}

/*	let [chanType, chanName] = evt.channel.split(/[\/-]/, 3);
	//logger.debug("XXX", evt.event, chanType, chanName, astConf.extensions);
	// incoming external sip call
	if (chanType === 'SIP' && astConf.extensions.includes(chanName) && evt.exten !== 's') {
		let channel_id = [chanName, evt.calleridnum ? evt.calleridnum : 'unknown'].join('_');
		s.asterisk.channels[channel_id] = { internalName: evt.channel };
		//engineApi.channelCreate(channel_id, {...});
		engineApi.channelUpdate(channel_id, {
			type: chanType.toLowerCase(),
			number: chanName,
		//	level: 67,
			direction: 'incoming',
			label: 'Extension',
			mode: 'ring',
		//	muted: false,
		//	timestamp: Date.now(),
		//	autoanswer: null,
			contact: {
				number: evt.calleridnum,
				name:  evt.calleridname,
			},
		//	recording: false,
		});
	}*/
});

ami.on('confbridgestoprecord', function (evt) {
	if (evt.conference === astConf.virtual.master) {
		engineApi.inboxUpdate({
			type: 'recording',
			timestamp: Date.now(),
			endpoint: 'master',
			content: s.asterisk.conference.file_name
		});
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
				cb(null,res);
			} else {
				console.error(JSON.stringify(res));
			}
		} else {
			if (cb) {
				cb(err,res);
			} else {
				console.error(JSON.stringify(err));
			}
		}
	});
}

function amiAction(options, cb) {
	ami.action(options, function(err, res) {
		if (!err) {
			if (cb) {
				cb(null,res);
			} else {
				console.error(JSON.stringify(res));
			}
		} else {
			if (cb) {
				cb(err,res);
			} else {
				console.error(JSON.stringify(err));
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
				cb(null,res);
			} else {
				console.error("ami command", command, JSON.stringify(res));
			}
		} else {
			if (cb) {
				cb(err,res);
			} else {
				console.error("ami command", command, JSON.stringify(err));
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
			console.error(JSON.stringify(res));
		} else {
			console.error(err.toString());
		}
	});
}

/*
function getVar(channel, variable, cb) {
	ami.action({
		action: 'Getvar',
		channel: channel,
		variable: variable
	}, function(err, res) {
		if (!err) {
			cb(null,res.value);
			console.error(JSON.stringify(res));
		} else {
			console.error(err.toString());
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

	ami.action({
		action: "Redirect",
		channel: channel,
		context: "from-internal",
		exten: astConf.virtual.master,
		priority: 1
	}, function(err, res) {
		if (!err) {
			console.error(JSON.stringify(res));
		} else {
			console.error(JSON.stringify(res));
		}
	});
};
*/
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
			console.error(JSON.stringify(res));
		} else {
			console.error(err.toString());
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
		console.error("setting chan volume!", channel, variable, level);
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

function sendSMS(device, number, content, cb) {
	ami.action({
		action: 'DongleSendSMS',
		Device: device,
		"Number": number.replace(/^0/, appConf.country_prefix),
		Message: content.replace('\n', '\\n'),
		Report: 'yes'
	}, function(err, res) {
		if (!err) {
			// {"response":"Success","actionid":"1458358510030","message":"[airtel1] SMS queued for send","id":"0x73c4dcc8"}
			console.error('sms ok', JSON.stringify(res));
			cb(null, res.id);
		} else {
			// {"response":"Error","actionid":"1458491768683","message":"Number not specified"}
			console.error('sms err', JSON.stringify(err));
			cb(err.message);
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
			myLib.consoleLog('debug', 'hangup ok', JSON.stringify(res));
		} else {
			cb(JSON.stringify(err));
			myLib.consoleLog('error', 'hangup err', JSON.stringify(err));
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
			console.error("originate sucess!!", JSON.stringify(res));
		} else {
			cb(["originate error", channel, destination, res.message].join('::'));
		}
	});
}

function amiOriginateViaTrunk(channel, destination, cb) {
	ami.action({
		action: "Originate",
		channel: channel,
		application: "Dial",
		data: destination,
		async: true,
	}, function(err, res) {
		if (!err) {
			cb();
			console.error("originate sucess!!", JSON.stringify(res));
		} else {
			cb(["originate error", channel, destination, res.message].join('::'));
		}
	});
}

function amiRedirect(channel, destination, cb) {
	myLib.consoleLog('debug', 'amiRedirect', [channel, destination]);
	destination = destination.split('@');
	ami.action({
		action: "Redirect",
		channel: channel,
		context: destination[1] ? destination[1] : "from-internal",
		exten: destination[0],
		priority: 1
	}, function(err, res) {
		if (!err) {
			cb(null,res);
		} else {
			cb(JSON.stringify(res));
		}
		console.error(JSON.stringify(res));
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
			console.error(JSON.stringify(res));
		} else {
			cb(JSON.stringify(res));
			console.error(JSON.stringify(res));
		}
	});
}


// provider interface

exports.originateLocal = function (number, destination, channel_id, cb) {
	/*
	if (s.asterisk.channels[channel_id] && s.asterisk.channels[channel_id].internalName) {
		if (astConf.virtual[destination]) {
			destination = astConf.virtual[destination];
		}
		amiRedirect(s.asterisk.channels[channel_id].internalName, destination, cb);
	} else {
		cb("PANIC - channel not found: " + channel_id);
	}
   */
	if (destination === 'master') {
		destination = "Local/" + astConf.virtual[destination];
	} else {
		destination = "SIP/" + destination;
	}
	if (channel_id) {
		let channel = s.ui.mixer.channels[channel_id];
		if (channel.type === 'dongle') {
			amiOriginateViaTrunk(destination, ["Dongle", channel_id, number.replace(/^0/, appConf.country_prefix)].join('/'), cb);
		} else if (channel.type === 'sip') {
			amiOriginateViaTrunk(destination, ["SIP", channel.number, number].join('/'), cb);
		} else {
			cb("PANIC::originateLocal - someone better implement this! " + channel.type);
		}
	} else {
		// must dial local format because of some dial-plan issue
		amiOriginate(destination, number.replace(prefixRegExp, '0'), cb);
	}
};

exports.originateRemote = function (number, destination, channel_id, cb) {
	number = number.replace(/^0/, appConf.country_prefix);
	if (channel_id && s.ui.mixer.channels[channel_id].type === 'dongle' ) {
		amiOriginate(["Dongle", channel_id, number].join('/'), astConf.virtual[destination], cb);
	} else {
		cb("PANIC::originateRemote - someone better implement this! " + channel_id)
	}
};

exports.setChannelRecording = function (channel_id, value, cb) {
	//setAmiChannelMuted(s.asterisk.channels[channel_id].internalName, value, direction, cb);
};

//exports.sendSMS = sendSMS;
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
/*
	ami.action({
		action: 'bridge',
		channel2: s.asterisk.channels[channel_id].internalName,
		channel1: s.asterisk.channels[busy_channel_id].internalName
	}, function(err, res) {
		if (!err) {
			//amiRedirect(s.asterisk.channels[channel_id].internalName, astConf.virtual.parked, cb);
		} else {
			cb(err);
		}
	});
*/

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


// ami.on('initialize', function() { ... })

// api interface exports

exports.setChannelMuted = function (channel_id, value, cb) {
	if (s.asterisk.channels[channel_id] && s.asterisk.channels[channel_id].internalName) {
		var direction = "in";
		setAmiChannelMuted(s.asterisk.channels[channel_id].internalName, value, direction, cb);
	} else {
		cb("PANIC - channel not found: " + channel_id);
	}
};

exports.setOperatorMuted = function (user_id, value, cb) {
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

exports.setOperatorVolume = function (channel_id, level, cb) {
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
	console.error("exports.setChanModes", channel_id, destination, channel_id2, destination2);
	console.error("exports.setChanModes", s.asterisk.channels[channel_id].internalName, destination, s.asterisk.channels[channel_id2].internalName, destination2);
	amiRedirectBoth(s.asterisk.channels[channel_id].internalName, destination, s.asterisk.channels[channel_id2].internalName, destination2, cb);
};

exports.setChanFree = function (channel_id, cb) {
	amiHangup(s.asterisk.channels[channel_id].internalName, cb);
};

exports.setPhoneBookEntry = function (number, label, cb) {
	amiSimpleCommand('database put cidname ' + number.replace(/^0/, appConf.country_prefix) + ' "' + label + '"', cb);
};

exports.setMasterRecording = function (value, cb) {
};

exports.sendContent = function(data, cb) {
	if (!data.channel_id) {
		data.channel_id = astConf.defaultSMS;
	}
	var timeout = 40; //seconds
	sendSMS(data.channel_id, data.endpoint, data.content, function(err, key){
		if (!err) {
			sms_out_pending.set(key, {
				data: data,
				cb: cb,
				timeout: setTimeout(function() {
					sms_out_pending.get(key).cb("Timeout");
					sms_out_pending.delete(key);
				}, timeout * 1000)
			});
		} else {
			cb(err);
		}
	});
};

// debug: catch all AMI events
ami.on('managerevent', function(evt) {
	let silentEvents = ["ConfbridgeTalking", 'Newexten', 'VarSet', 'Registry'];
	if (!silentEvents.includes(evt.event) && evt.event.indexOf("Dongle") !== 0 && evt.event.indexOf("RTCP") !== 0) {
		//console.error('* ', JSON.stringify(evt));
		logger.debug("managerevent", evt);
	}
	//else console.error('** ', JSON.stringify(evt));
});

// debug: expose ami command
exports.command = amiSimpleCommand;

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
/*
ami.on('softhanguprequest', function(evt) {
	//console.error(JSON.stringify(evt));
});
*/
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
//	{"event":"DongleSMSStatus","privilege":"call,all","device":"airtel1","id":"0x73c4dcc8","status":"NotSent"}
//	{"event":"DongleSMSStatus","privilege":"call,all","device":"airtel1","id":"0x7392f0e8","status":"Sent"}
	console.error(JSON.stringify(evt));
	if (sms_out_pending.has(evt.id)) {
		clearTimeout(sms_out_pending.get(evt.id).timeout);
		if (evt.status !== "Sent") {
			sms_out_pending.get(evt.id).cb("Message not sent");
		} else {
			//todo: Use .endpoint instead of .contact_id and .source
			sms_out_pending.get(evt.id).data.timestamp = Date.now();
			sms_out_pending.get(evt.id).cb();
			engineApi.inboxUpdate(sms_out_pending.get(evt.id).data);
		}
		sms_out_pending.delete(evt.id);
	}
});
/*
ami.on('dongleshowdevicescomplete', function(evt) {
	console.error(JSON.stringify(evt));
});
*/
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

var deleteStoredSms = function (dongleId) {
	s.asterisk.channels[dongleId].sms_count = 0;
	ami.action({
		action: "Command",
		command: "dongle cmd " + dongleId + " AT+CMGD=1,4",
	}, function(err, res) {
		myLib.consoleLog('debug', "deleteStoredSms", res);
	});
};

var consoleToMaster = function() {
	ami.action({
		action: "Command",
		command: "console dial " + astConf.virtual.master // todo: dial different context with appropriete confbridge properties
	}, function(err, res) {
		myLib.consoleLog('debug', "console dial", res);
		if (!err) {
			myLib.consoleLog('log', 'init', "Console connected to master");
		} else {
			myLib.consoleLog('panic', 'init', "Console NOT connected to master!");
		}
	});
};

var consoleHangup = function() {
	ami.action({
		action: "Command",
		command: "console hangup"
	}, function(err, res) {
		myLib.consoleLog('debug', "console hangup", res);
	});
};
