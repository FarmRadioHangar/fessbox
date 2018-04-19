var unirest = require('unirest');
var logger 	= new (require("./logger"))(__filename);

// var ZAMMAD_API_TOKEN = process.env.ZAMMAD_API_TOKEN || 'VxGcORyujvgYwmVgXLjHewnAR8Jp0ek_q5LhW0AgkJ6_vAanQog_we9LX7_j82Z6';
var ZAMMAD_API_TOKEN = process.env.ZAMMAD_API_TOKEN || 'No1mJ8B2EPJKAwLeleigM84xnxKcg_92qJ9nR12RaDX9VvAORoRSTzfAdXU_lppr';
var ZAMMAD_API_URL = process.env.ZAMMAD_API_URL || 'https://answers.uliza.fm/api/v1';

module.exports = {

  ZAMMAD_API_URL: ZAMMAD_API_URL,
  get: function(uri, query = null, encoding = 'utf-8', timeout = 3000) {
    return new Promise((resolve, reject) => {
      let Request = unirest.get([ZAMMAD_API_URL, uri].join('/'))
      .headers('Authorization', ['Token token', ZAMMAD_API_TOKEN].join('='))
      .encoding(encoding)
      .timeout(timeout);
      if (query) {
        Request.query(query);
      }
      Request.end(response => {
        if (encoding !== 'binary') {
          if (response.error) {
            logger.error('HTTP GET Request responded with error!', response.error);
            reject(response.error);
          } else {
            resolve(response.body);
          }
        } else {
          resolve(response.raw_body);
        }
      });
    });
  }
};
