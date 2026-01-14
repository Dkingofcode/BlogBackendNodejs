const logger = require('../utils/logger');

class DatabaseFactory {
  static async createDatabase() {
    const dbType = process.env.DATABASE_TYPE || 'postgres';
    
    logger.info(`Initializing database: ${dbType}`);

    if (dbType === 'mongodb') {
      const MongoDatabase = require('./db');
      return new MongoDatabase();
    } else if (dbType === 'postgres') {
      const PostgresDatabase = require('./database');
      return new PostgresDatabase();
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}

module.exports = DatabaseFactory;