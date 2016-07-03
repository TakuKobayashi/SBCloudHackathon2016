var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('user', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    token: { type: 'string', notNull: true },
    googleAccessToken: { type: 'text'},
    updatedAt: 'datetime',
    createdAt: 'datetime'
  }, function(){
    db.addIndex('user', 'user_google_access_token', 'googleAccessToken', function(){
      db.addIndex('user', 'user_token', 'token', callback);
    });
  });
};

exports.down = function(db, callback) {
  db.dropTable('user', callback);
};
