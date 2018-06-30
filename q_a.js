var fsPath		= require('fs-path');
var logger 		= new (require("./logger"))(__filename);
var engineApi	= require('./engineApi');
var redisClient	= require('./redisClient');
var db			= require('./db');
var zammad		= require('./zammad');
var wss 		= require("./websocket");

var ZAMMAD_POLLING_INTERVAL			= process.env.ZAMMAD_POLLING_INTERVAL || 15; // In Minutes
var ZAMMAD_POLLING_BREAK			= process.env.ZAMMAD_POLLING_BREAK || 5;
var VALID_ATTACHMENTS_EXTENSIONS	= process.env.VALID_ATTACHMENTS_EXTENSIONS || ['mp3', 'wav', 'webm'];
var FS_ATTACHEMENTS_PATH			= process.env.FS_ATTACHEMENTS_PATH || '/srv/http/answers';

var cachedAgents = [];
var lastZammadPoll = null;

//logger.debug('Connecting to Zammad service');

function dateDifferenceInSeconds(date1, date2) {
	var diff = Math.abs(date1 - date2);
	return Math.floor(diff / 1000);
}

function getTicketsFromZammad() {
	return new Promise((fnResolve, fnReject) => {
		redisClient.get('lastZammadQuery', (err, reply) => {
			let query = '(';
			if (reply) {
				query += 'updated_at:>now-' + dateDifferenceInSeconds(new Date(+reply), new Date()) + 's AND ';
			}
			query += 'state:closed)';
			zammad.get('tickets/search', {
				query: query,
				expand: true,
			})
			.then(body => {
				return new Promise((resolve, reject) => {
					if (!body.length) return fnResolve(body);
					let ticketCount = body.length;
					body.map(ticket => ({
						id: ticket.id,
						title: ticket.title,
						subscriber_phone: ticket.customer,
						articles_count: ticket.article_count,
						state_id: ticket.state_id,
						closed_at: ticket.close_at
					}))
					.forEach((ticket, index, tickets) => {
						zammad.get(['ticket_articles/by_ticket', ticket.id].join('/'))
						.then(body => {
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
									db.createTicket(ticket.id, ticket.title, ticket.subscriber_phone, ticket.articles_count, ticket.state_id, ticket.closed_at)
									.then(() => {
										zammad.get('tags', {
											object: 'Ticket',
											o_id: ticket.id
										})
										.then(body => {
											let redisMulti = redisClient.multi();
											let redisTicketKey = ['tickets', ticket.id].join(':');
											if (body.tags) {
												ticket.tags = body.tags;
												redisMulti.set([redisTicketKey, 'tags'].join(':'), JSON.stringify(ticket.tags));											}
											let articleCount = ticket.articles.length;
											ticket.articles.forEach(article => {
												let attachmentCount = article.attachments.length;
												redisMulti.hset([redisTicketKey, 'articles'].join(':'), article.id, JSON.stringify(article));
												article.attachments.forEach((attachment, attachmentIndex) => {
													let path = [FS_ATTACHEMENTS_PATH, ticket.id, article.id, attachment.filename].join('/');
													zammad.get(['ticket_attachment', ticket.id, article.id, attachment.id].join('/'), null, 'binary')
													.then(body => {
														try {
															fsPath.writeFileSync(path, body, 'binary');
														}
														catch(error) {
															logger.error('Failed to save attachment "' + attachment.filename + '" to the file system.');
															return fnReject(error);
														}
														if (--attachmentCount === 0 && --articleCount === 0 && ++ticketCount === tickets.length) {
															redisClient.set('lastZammadQuery', Date.now());
															fnResolve(tickets);
														}
													})
													.catch(error => {
														logger.error('Failed to fetch attachment for article ' + article.id, error);
														return fnReject(error)
													});
												});
											})
											redisMulti.exec();
										})
										.catch(error => {
											logger.error('Failed to fetch tags for ticket ' + ticket.id, error);
											return fnReject(error)
										});
									})
									.catch(error => {
										logger.error('Failed to insert ticket into SQLite database.', error);
										return fnReject(error)
									});
								});
							}
						})
						.catch(error => {
							logger.error('Failed to fetch ticket articles for ticket ' + ticket.id, error);
							return fnReject(error)
						});
					});
				});
			})
			.catch(error => {
				logger.error('Failed to fetch tickets from Zammad!', error);
				return fnReject(error);
			});
		});
	});
}

function getRedisDataForTicket(id) {
	return new Promise((resolve, reject) => {
		let ticket = {};
		redisClient.hgetall(['tickets', id].join(':'), (err, data) => {
			if (data) {
				Object.assign(ticket, data);
			}
			redisClient.hgetall(['tickets', id, 'articles'].join(':'), (err, articles) => {
				articles = Object.values(articles);
				articles = articles.map(article => JSON.parse(article));
				ticket.articles = articles;
				redisClient.get(['tickets', id, 'tags'].join(':'), (err, tags) => {
					if (tags) {
						tags = JSON.parse(tags);
						ticket.tags = tags;
					}
					resolve(ticket);
				});
			});
		});
	});
}


function getTickets(filter) {
	return new Promise((resolve, reject) => {
		db.getTickets(filter).then(tickets => {
			let count = tickets.length;
			tickets.forEach(ticket => {
				getRedisDataForTicket(ticket.id).then(ticketData => {
					Object.assign(ticket, ticketData);
					if (--count === 0) {
						resolve(tickets);
						pollZammad();
					}
				});
			});
			if (!tickets.length) {
				resolve([]);
				pollZammad();
			}
		}).catch(error => {
			logger.debug('Failed to get tickets from database!', error);
		});
	});
}

function getAgents(cb) {
	logger.debug('Get agents from Zammad!');
	if (!cb) return cachedAgents;
	zammad.get('users/search', {
		query: '(active:true AND role_ids:2 AND phone:>0)',
		expand: true
	})
	.then(body => {
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

function pollZammad() {
	if (lastZammadPoll && lastZammadPoll > Date.now() - ZAMMAD_POLLING_BREAK * 60 * 1000) {
		return logger.debug('Zammad was already polled in the past ' + ZAMMAD_POLLING_BREAK + ' minutes', lastZammadPoll);
	}
	lastZammadPoll = Date.now();
	logger.debug('Polling Zammad');
	getTicketsFromZammad().then(newTickets => {
		let count = newTickets.length;
		let tickets = [];
		newTickets.forEach(ticket => {
			tickets.push({ id: ticket.id, data: ticket });
			if (--count === 0) {
				logger.debug('New tickets fetched from Zammad!', newTickets);
				wss.broadcastEvent('questions:update', tickets);
			}
		});
	})
	.catch(error => {
		logger.debug('Failed to fetch tickets from zammad!', error);
	});
}

function setFavorite(ids, favorite) {
	return new Promise((resolve, reject) => {
		let filter = { ids };
		db.getTickets(filter).then((tickets) => {
			let ids = [];
			let updated = [];
			let count = tickets.length;
			tickets.forEach(ticket => {
				ids.push(ticket.id);
				redisClient.hset(['tickets', ticket.id].join(':'), 'favorite', favorite, (err, reply) => {
					getRedisDataForTicket(ticket.id).then(ticketData => {
						Object.assign(ticket, ticketData);
						updated.push({ id: ticket.id, data: ticket });
						if (--count === 0) {
							redisClient[favorite ? 'sadd' : 'srem']("ticketTags:favorite", ids);
							resolve(updated);
						}
					});
				});
			});
		})
		.catch(error => {
			logger.debug('Query Error!', error);
			reject(error);
		});
	});
}

function deleteTickets(ids) {
	logger.debug('Delete tickets..', ids);
	return new Promise((resolve, reject) => {
		let redisMulti = redisClient.multi();
		let count = ids.length;
		let deleted = [];
		db.deleteTickets(ids).then((results) => {
			resolve(deleted);
			logger.debug('Tickets deleted..');
			redisMulti.srem('ticketTags:favorite', ids);
			ids.forEach(id => {
				deleted.push({ id: id, data: null });
				let ticketKey = ['tickets', id].join(':');
				let ticketArticlesKey = [ticketKey, 'articles'].join(':');
				let ticketTagsKey = [ticketKey, 'tags'].join(':');
				redisMulti.del([ticketKey, ticketArticlesKey, ticketTagsKey]);
				try {
					fsPath.remove([FS_ATTACHEMENTS_PATH, id].join('/'));
					logger.debug('Removed file..');
				}
				catch(error) {
					logger.debug('Failed to delete ticket from file system!', error);
				}
				if (--count === 0) {
					redisMulti.exec((err, reply) => {
						logger.debug('Redis commands executed.');
					});
				}
			});
		}).catch(error => {
			logger.debug('Failed to delete tickets!', error);
			reject(error);
		});
	});
}

db.init()
.then(() => {
	logger.notice('SQLite database initialized successfully!');
	setInterval(pollZammad, ZAMMAD_POLLING_INTERVAL * 60 * 1000);
})
.catch(error => {
	logger.error('SQLite database initialization failed!', error);
});

redisClient.get('cachedAgents', (err, reply) => {
	if (!err && reply) {
		cachedAgents = JSON.parse(reply);
	} else {
		getAgents((err, agents) => { if (!err) cachedAgents = agents });
	}
});

module.exports.getAgents = getAgents;
module.exports.getTickets = getTickets;
module.exports.deleteTickets = deleteTickets;
module.exports.setFavorite = setFavorite;
