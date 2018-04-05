var requestJson = require('request-json');
var api = require('./includes/api');
var unirest = require('unirest');

// var ZAMMAD_API_TOKEN = process.env.ZAMMAD_API_TOKEN || 'VxGcORyujvgYwmVgXLjHewnAR8Jp0ek_q5LhW0AgkJ6_vAanQog_we9LX7_j82Z6';
var ZAMMAD_API_TOKEN = process.env.ZAMMAD_API_TOKEN || 'No1mJ8B2EPJKAwLeleigM84xnxKcg_92qJ9nR12RaDX9VvAORoRSTzfAdXU_lppr';
var ZAMMAD_API_URL = process.env.ZAMMAD_API_URL || 
  'https://answers.uliza.fm/api/v1/';

var zammad = requestJson.createClient(ZAMMAD_API_URL, { timeout: 3000 });

zammad.headers['Authorization'] = 'Token token=' + ZAMMAD_API_TOKEN;

module.exports = {

  ZAMMAD_API_URL: ZAMMAD_API_URL,

  get: function(uri, options) {
    return api.makeRequest(zammad, uri, options, 'GET');
  },

  post: function(uri, data, options) {
    return api.makeRequest(zammad, uri, options, 'POST', data);
  },

  put: function(uri, data, options) {
    return api.makeRequest(zammad, uri, options, 'PUT', data);
  },

  patch: function(uri, data, options) {
    return api.makeRequest(zammad, uri, options, 'PATCH', data);
  },

  getAttachment: function(ticket_id, article_id, attachment_id) {
    return new Promise(function(resolve, reject) {
      unirest.get([ZAMMAD_API_URL, 'ticket_attachment', ticket_id, article_id, attachment_id].join('/'))
      .query({ disposition: 'attachment' })
      .headers('Authorization', zammad.headers['Authorization'])
      .encoding('binary')
      .end(function(response) {
        resolve(response);
      });
    });
  }

};
