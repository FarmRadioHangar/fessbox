var chalk = require('chalk');

function buildRequest(yield, silent) {
  return new Promise(function(resolve, reject) {
    var callback = function(error, response, body) {
      if (error) {
        return reject(error);
      }
      if (isOk(response.statusCode)) {
        if (!silent) {
          console.log(
            chalk.yellow('[response_code] ')
            + chalk.green('\u2714 ')
            + chalk.white(response.statusCode)
          );
        }
      } else {
        /* Log body if we get something else than a 2xx response. */
        if (!silent) {
          console.log(
            chalk.redBright('[response_code] ')
            + chalk.white(response.statusCode)
          );
          console.log(
            chalk.redBright('[response_body] ') + JSON.stringify(body)
          );
        }
      }
      resolve({
        all: response,
        body: body
      });
    };
    yield(callback);
  });
}

function isOk(code) {
  return '2' === (code + '')[0];
}

function validate(response, allowed) {
  var code = response.all.statusCode;
  if (!isOk(code) && -1 == allowed.indexOf(code)) {
    throw new Error('Server returned a non-200 response code.');
  }
}

module.exports = {

  makeRequest: function(client, uri, options, method, data) {
    options = options || {};
    // console.log('makeRequest', uri, options, client);
    if (!options.silent) {
      console.log(
        chalk.magentaBright.bold(method + ' ' + client.host + uri)
      );
    }
    return buildRequest(function(callback) {
      if ('object' === typeof(data)) {
        if (!options.silent && false !== options.logRequestBody) {
          /* Log request body for debugging purposes */
          console.log(
            chalk.magentaBright('[request_body] ') + JSON.stringify(data)
          );
        }
        client[method.toLowerCase()](uri, data, callback);
      } else {
        client[method.toLowerCase()](uri, callback);
      }
    }, options.silent)
    .then(function(response) {
      validate(response, options.accept || []);
      return response;
    });
  }

};
