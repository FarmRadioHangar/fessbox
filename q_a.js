//require('dotenv').config();
var logger = new (require("./logger"))(__filename);

var base64		 = require('base64-stream');
var bodyparser = require('body-parser');
var chalk			= require('chalk');
/*
var cors			 = require('cors');
var express		= require('express');
var jwks			 = require('jwks-rsa');
var jwt				= require('express-jwt');
var spinners	 = require('cli-spinners');
var viamo			= require('./viamo');
var ora				= require('ora');
*/
var https			= require('https');
var lame			 = require('lame');
var sequential = require('promise-sequential');
var request		= require('request');
var db				 = require('./db');
var api				= require('./api');
var zammad		 = require('./zammad');
var engineApi	= require('./engineApi');
var redisClient			= require('./redisClient');
var fsPath		 = require('fs-path');

/*
var app = express();

app.use(cors());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(express.static('demo-spa'));

var SERVER_PORT = process.env.PORT || 8099;

var router = express.Router();
*/

var ZAMMAD_POLLING_INTERVAL = process.env.ZAMMAD_POLLING_INTERVAL || 6000;
var VALID_ATTACHMENTS_EXTENSIONS = process.env.VALID_ATTACHMENTS_EXTENSIONS || ['mp3', 'wav', 'webm'];
var FS_ATTACHEMENTS_PATH = process.env.FS_ATTACHEMENTS_PATH || '/srv/http/answers';

var closedTickets = [];
var cachedAgents = [];

function getBlock(interactions, id) {
	for (var i = 0; i < interactions.length; ++i) {
		if (interactions[i].block_id == id) {
			return interactions[i];
		}
	}
	return null;
}

function encodeAudio(url) {
	return new Promise(function(resolve, reject) {
		var encoder = new lame.Encoder({
			channels: 1,
			bitDepth: 16,
			sampleRate: 8000,
			bitRate: 128,
			outSampleRate: 22050
		});
		https.get(url, function(response) {
			var output = new base64.Encode();
			response.pipe(encoder);
			encoder.pipe(output);
			var buffer = '';
			output.on('data', function(chunk) {
				buffer += chunk.toString();
			});
			output.on('end', function() {
				resolve(buffer);
			});
			output.on('error', function(error) {
				reject(error);
			});
		});
	});
}

logger.debug('Connecting to Zammad service');

function monitorTicket(ticket, states) {
	return zammad.get('tickets/' + ticket.zammad_id, {
		silent: true
	})
	.then(function(response) {
		var zammadTicket = response.body;
		if (ticket.state_id != zammadTicket.state_id) {
			/* Ticket state has changed. Was the ticket closed? */
			if ('closed' === states[zammadTicket.state_id].name) {
				console.log(
					chalk.yellow('[zammad_ticket_closed] ') + ticket.zammad_id
				);
				console.log(ticket);
				/* TODO: send notification to voxbox-ui via engineApi */
			}
			db.updateTicketState(ticket.id, zammadTicket.state_id);
		}
		return zammad.get('ticket_articles/by_ticket/' + ticket.zammad_id, {
			silent: true
		});
	})
	.then(function(response) {
		var articles = response.body;
		var diff = articles.length - ticket.articles_count;
		if (diff > 0) {
			/* One or more articles have been added. */
			db.updateArticlesCount(ticket.id, articles.length);
			var recent = articles.slice(-diff);
			console.log(
				chalk.yellow('[zammad_ticket_articles_count_changed] ') + ticket.zammad_id
			);
			console.log(
				chalk.cyan('[zammad_ticket_article(s)_added] ')
				+ JSON.stringify(recent)
			);
		}
	});
}

function setPollTimeout() {
	setTimeout(function() {
		pollZammad()
		.catch(function(error) {
			console.error(error);
		});
	}, ZAMMAD_POLLING_INTERVAL);
}

function pollZammad() {
	var states = {};
	console.log('pollZamad executed!');
	return zammad.get('ticket_states', {
		silent: true
	})
	.then(function(results) {
		results.body.forEach(function(state) {
			states[state.id] = state;
		});
		return db.getTickets();
	})
	.then(function(results) {
		console.log('after states are here, map em', results);
		return sequential(
			results.map(function(ticket) {
				return function() {
					return monitorTicket(ticket, states);
				}
			})
		);
	})
	.then(function() {
		setPollTimeout();
	});
}

function dateDifferenceInSeconds(date1, date2) {
	var diff = Math.abs(date1 - date2);
	return Math.floor(diff / 1000);
}

function saveTicketAndArticle(ticket) {
	redis.set(['tickets', ticket.zammad_id, 'tags'].join(':'), JSON.stringify(ticket.tags));
	ticket.articles.forEach(article => redis.hset(['tickets', ticket.zammad_id].join(':'), article.id, JSON.stringify(article)));
	db.createTicket(ticket.zammad_id, ticket.subscriber_phone, ticket.articles_count, ticket.state_id, ticket.created_at);
}


function getTickets() {
	return new Promise((fnResolve, fnReject) => {
		redisClient.get('lastZammadQuery', (err, reply) => {
			let query = 'tickets/search?query=(';
			if (reply) {
				query += 'updated_at:>now-' + dateDifferenceInSeconds(new Date(+reply), new Date()) + 's	AND ';
			}
			query += 'state:closed)&expand=true';

			zammad.get(query, { silent: true })
			.then(({ body }) => {
				redisClient.set('lastZammadQuery', Date.now());
				return new Promise((resolve, reject) => {
					if (!body.length) return fnResolve(body);
					let ticketCount = body.length;
					body.map(ticket => ({
						zammad_id: ticket.id,
						subscriber_phone: ticket.customer,
						articles_count: ticket.article_count,
						state_id: ticket.state_id,
						created_at: ticket.created_at
					}))
					.forEach((ticket, index, tickets) => {
						zammad.get('ticket_articles/by_ticket/' + ticket.zammad_id, { silent: true })
						.then(({ body }) => {
							let isValidTicket = false;
							ticket.articles = body.filter((article, index, articles) => {
								article.attachments = article.attachments.filter(attachment => {
									let filenameSplitted = attachment.filename.split('.');
									let extension = filenameSplitted[filenameSplitted.length - 1];
									return VALID_ATTACHMENTS_EXTENSIONS.includes(extension);
								});
								if (article.attachments.length && index === 0) isValidTicket = true;
								return article.attachments.length && isValidTicket;
							})
							.map(article => ({
								id: article.id,
								from: article.from,
								subject: article.subject,
								attachments: article.attachments,
								created_at: article.created_at
							}));
							if (--ticketCount === 0) {
								tickets.filter(ticket => (ticket.articles.length >= 2)).forEach((ticket, index, tickets) => {
									db.createTicket(ticket.zammad_id, ticket.subscriber_phone, ticket.articles_count, ticket.state_id, ticket.created_at)
									.then(() => {
										zammad.get('tags/?object=Ticket&o_id=' + ticket.zammad_id, { silent: true })
										.then(({ body }) => {
											let redisMulti = redisClient.multi();
											let redisTicketKey = ['tickets', ticket.zammad_id].join(':');
											redisMulti.set([redisTicketKey, 'tags'].join(':'), JSON.stringify(body.tags));
											let articleCount = ticket.articles.length;
											ticket.articles.forEach(article => {
												let attachmentCount = article.attachments.length;
												redisMulti.hset(redisTicketKey, article.id, JSON.stringify(article));
												article.attachments.forEach((attachment, attachmentIndex) => {
													let path = [FS_ATTACHEMENTS_PATH, ticket.zammad_id, article.id, attachment.filename].join('/');
													zammad.getAttachment(ticket.zammad_id, article.id, attachment.id)
													.then(({ body }) => {
														fsPath.writeFileSync(path, body, 'binary');
														if (--attachmentCount === 0 && --articleCount === 0 && ++ticketCount === tickets.length) {
															fnResolve(tickets);
														}
													});
												});
											})
											redisMulti.exec();
										});
									});
								});
							}
						});
					});
				});
			});
		});
	});
}

function getAgents(cb) {
	if (!cb) return cachedAgents;
	zammad.get('users/search?query=(active:true AND role_ids:2 AND phone:>0)&expand=true', { silent: true })
	.then(({ body }) => {
		let agents = body.map(agent => ({
			id: agent.id,
			email: agent.email,
			firstname: agent.firstname,
			lastname: agent.lastname,
			phone: agent.phone,
			mobile: agent.mobile,
			image: agent.image,
			organization_id: agent.organization_id,
			groups: agent.groups
		}));
		cachedAgents = agents;
		redisClient.set('cachedAgents', JSON.stringify(agents));
		cb(null, agents);
	}).catch(() => {
		//.. Some error happend get the cached values
		cb('Connection Timeout', cachedAgents);
	});
}

redisClient.get('cachedAgents', (err, reply) => {
	if (!err) {
		cachedAgents = JSON.parse(reply);
	}
})

zammad.get('users/me', {silent: true})
.catch(function(error) {
	//spinner.fail();
	console.error('Failed connecting to Zammad API.');
	process.exit(1);
})
.then(function() { /* Zammad API connection OK. */
	//spinner.succeed();
	// setPollTimeout();
	return db.init();
})
.then(function() {
	/**
	 * Once the database is initialized fetch the last ticket from the database
	 */
	// getTickets().then(tickets => {
	// 	console.log('last response from fetchTickets', tickets);
	// });
	getAgents((err, agents) => {
		console.log('got agents..', err, agents);
	});
	// getAgents()
	//return new Promise((resolve, reject) => {
	//	console.log(this, 'inside promise');
	//	db.getTickets().then((tickets) => {
	//		if (tickets.length) {
	//			console.log('tickets found!');
	//			/**
	//			 * If there are tickets check if there are newer closed tickets
	//			 */
	//			fetchTickets(tickets[0].created_at)
	//			.then(newTickets => {
	//				let count = 0;
	//				tickets.forEach(ticket => {
	//					redis.hgetall(['tickets', ticket.zammad_id].join(':'), (error, reply) => {
	//						if (!error && reply) {
	//							let articles = Object.values(reply);
	//							articles = articles.map(article => JSON.parse(article));
	//							ticket.articles = articles;
	//						}
	//						redis.get(['tickets', ticket.zammad_id, 'tags'].join(':'), (error, reply) => {
	//							if (!error && reply) {
	//								let tags = JSON.parse(reply);
	//								ticket.tags = tags;
	//							}
	//							if (++count === tickets.length) {
	//								if (newTickets.length)
	//									tickets.unshift(...newTickets);
	//								resolve(tickets);
	//							}
	//						});
	//					});
	//				})
	//			})
	//		} else {
	//			/**
	//			 * If there are no tickets, fetch all closed tickets from zammad
	//			 */
	//			console.log('tickets not found!');
	//			fetchTickets().then(tickets => resolve(tickets));
	//		}
	//	});
	//})
})
.then((tickets) => {
	/**
	 * Now that we have the tickets obtained from zammad or database
	 * we are ready to notify voxbox for questionsUpdate
	 * and also we are in the right place to start a polling timer to check for new closed tickets
	 */
	/**
	 * TODO:
	 * => Notify VoxBox
	 * => Save the tickets in memory for futher usage
	 * => Start polling zammad for new tickets
	 */
	// closedTickets = tickets;
	//console.log('okay we are done with everything here, filtered, mapped and whatnot!', tickets);
	//console.log(this);
})
.catch(function(error) {
	//spinner.fail();
	console.error(error);
	process.exit(1);
});

module.exports.getAgents = getAgents;
module.exports.getTickets = getTickets;