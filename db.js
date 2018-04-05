var sqlite = require('sqlite');

var db;

module.exports = {

  init: function() {
    return sqlite.open('db.sqlite')
    .then(function(connection) {
      db = connection;
      return db.run('CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY, zammad_id INTEGER, subscriber_phone TEXT, audio TEXT, articles_count INTEGER, state_id INTEGER, created_at TEXT);')
    })
    .then(function() {
      return db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, auth0_user_id INTEGER, zammad_token TEXT, firebase_login TEXT, sip_username TEXT, sip_password TEXT, sip_host TEXT, created_at TEXT);')
    })
    .then(function() {
      return db.run('CREATE INDEX IF NOT EXISTS auth0_user_ids ON users (auth0_user_id);')
    });
  },

  createTicket: function(zammadId, phone, articles_count, state_id, created_at) {
    return db.run(
      'INSERT INTO tickets (zammad_id, subscriber_phone, articles_count, state_id, created_at) VALUES (?, ?, ?, ?, ?);', zammadId, phone, articles_count, state_id, created_at
    );
  },
  // createTicket: function(zammadId, phone, audio, articles_count, created_at) {
  //   return db.run(
  //     'INSERT INTO tickets (zammad_id, subscriber_phone, audio, articles_count, created_at) VALUES (?, ?, ?, ?, ?);', zammadId, phone, audio, articles_count, created_at
  //   );
  // },
  
  updateArticlesCount(id, count) {
    return db.run(
      'UPDATE tickets SET articles_count = ? WHERE id = ?;', count, id
    );
  },

  updateTicketState(id, ticketState) {
    return db.run(
      'UPDATE tickets SET state_id = ? WHERE id = ?;', ticketState, id
    );
  },

  getTickets: function() {
    return db.all('SELECT * FROM tickets ORDER BY created_at DESC;');
  },

  getUser: function(auth0Id) {
    return db.get('SELECT * FROM users where auth0_user_id = ?;', auth0Id);
  },

  createUser: function(auth0Id, zammadToken, firebaseLogin, sipUsername, sipPassword, sipHost) {
    return db.run(
      'INSERT INTO users (auth0_user_id, zammad_token, firebase_login, sip_username, sip_password, sip_host, created_at) VALUES (?, ?, ?, ?, ?, ?, DATETIME(\'now\'));', auth0Id, zammadToken, firebaseLogin, sipUsername, sipPassword, sipHost
    );
  }

};
