/**
 * Database configuration index
 * Exports all database-related configurations
 */

const dbConnection = require('./connection');

module.exports = {
  connect: dbConnection.connect,
  disconnect: dbConnection.disconnect
}; 