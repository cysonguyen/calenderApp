const { Sequelize } = require('sequelize');
const config = require('./database.js');

const env = process.env.NODE_ENV || 'development';
const { username, password, database, host, dialect, logging } = config[env];

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  logging
});

module.exports = sequelize;