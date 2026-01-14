require('dotenv').config();
const { createServer } = require('http');
const DatabaseFactory = require('./src/config/database.factory');
const createApp = require('./src/app');
const logger = require('./src/utils/logger');

async function startServer() {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    const database = await DatabaseFactory.createDatabase();
    await database.connect();

    // Get models
    const models = database.getModels();
    logger.info('Database models initialized');

    // Create Express app
    const app = createApp(models);

    // Create HTTP server
    const server = createServer(app);

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║  🚀 Blog Backend API Server Running!                             ║
║                                                                   ║
║  📍 Server:        http://localhost:${PORT}                            ║
║  📚 API Docs:      http://localhost:${PORT}/api/docs                   ║
║  💚 Health Check:  http://localhost:${PORT}/health                     ║
║  🗄️  Database:      ${process.env.DATABASE_TYPE.toUpperCase().padEnd(10)}                               ║
║  🔧 Environment:   ${process.env.NODE_ENV.toUpperCase().padEnd(10)}                               ║
║  📅 Started:       ${new Date().toLocaleString().padEnd(10)}                          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        await database.disconnect();
        logger.info('Database connection closed');
        
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = startServer;