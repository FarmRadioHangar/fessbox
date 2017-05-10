const appConfig = require("./etc/app.json");
const hapi = require('hapi');
const server = new hapi.Server();

server.connection({
	host: '0.0.0.0',
	port: appConfig.restPort,
	routes: {
		cors: {
			origin: ["*"],
			additionalHeaders: ['accept-language', 'cache-control', 'x-requested-with'],
		}
	}
});

let apiHandler = require("./rest");
server.route({
	method: 'GET',
	path:'/{name}',
	handler: function (request, reply) {
		apiHandler[request.params.name](request.query, (statusCode, content) => {
			reply(null, content).code(statusCode);
		});
	},
	config: { validate: {
		params: function (value, options, cb ) {
			cb(typeof apiHandler[value.name] !== 'function', value);
		}
	}}
});

server.start((err) => {
	if (err) {
		throw err;
	}
	console.error(`Server running at: ${server.info.uri}`);
});

