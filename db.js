var sqlite = require('sqlite');

var db;

function _parseIdsForQuery(ids) {
  return '(' + ids.map(id => (id)).join(', ') + ')';
}

module.exports = {

  init: function() {
    return new Promise((resolve, reject) => {
      sqlite.open([__dirname, 'db.sqlite'].join('/'), { Promise }).then((connection) => {
        db = connection;
        db.run('CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY, subscriber_phone TEXT, title TEXT, articles_count INTEGER, state_id INTEGER, closed_at TEXT);')
        .then(() => {
          db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, auth0_user_id INTEGER, zammad_token TEXT, firebase_login TEXT, sip_username TEXT, sip_password TEXT, sip_host TEXT, created_at TEXT);')
          .then(() => {
            db.run('CREATE INDEX IF NOT EXISTS auth0_user_ids ON users (auth0_user_id);')
            .then(() => resolve())
            .catch(error => reject(error));
          })
          .catch(error => reject(error));
        })
        .catch(error => reject(error));
      })
      .catch(error => reject(error));
    });
  },

  createTicket: function(zammadId, title, phone, articles_count, state_id, closed_at) {
    return db.run(
      'INSERT INTO tickets (id, title, subscriber_phone, articles_count, state_id, closed_at) VALUES (?, ?, ?, ?, ?, ?);', zammadId, title, phone, articles_count, state_id, closed_at
    );
  },

  getTickets: function(filter) {
    let query = ['SELECT * FROM tickets'];
    if (filter) {
      query.push('WHERE');
      let where = [];
      if (filter.ids) {
        where.push(['id IN', _parseIdsForQuery(filter.ids)].join(' '));
      }
      if (filter.from) {
        where.push(["DATE(closed_at)", ">=", "DATE(" + filter.from / 1000 + ", 'unixepoch', 'localtime')"].join(' '));
      }
      if (filter.to) {
        where.push(["DATE(closed_at)", "<=", "DATE(" + filter.to / 1000 + ", 'unixepoch', 'localtime')"].join(' '));
      }
      query.push(where.join(where.length > 1 ? ' AND ' : ' '));
    }
    query.push('ORDER BY DATE(closed_at)');
    return db.all(query.join(' '));
  },

  deleteTickets: function(ids) {
    if (ids && ids.length) {
      console.error('DELETE FROM tickets WHERE id IN', _parseIdsForQuery(ids));
      return db.run(['DELETE FROM tickets WHERE id IN', _parseIdsForQuery(ids)].join(' '));
    }
    return db.run('DELETE FROM tickets');
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
