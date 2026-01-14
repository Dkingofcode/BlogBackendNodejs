// const mongoose = require("mongoose");
// require('dotenv').config();

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log("MongoDB connected...");
//     }catch(error) {
//         console.error("MongoDB connection error:", error);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;

















const mongoose = require('mongoose');
const logger = require('../utils/logger');

class MongoDatabase {
  constructor() {
    this.connection = null;
    this.models = {};
  }

  async connect() {
    try {
      const mongoUri = process.env.NODE_ENV === 'test'
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      };

      this.connection = await mongoose.connect(mongoUri, options);
      
      logger.info('MongoDB connection established successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      // Initialize models
      this.initializeModels();

      return this.connection;
    } catch (error) {
      logger.error('Unable to connect to MongoDB:', error);
      throw error;
    }
  }

  initializeModels() {
    // Import MongoDB models
    this.models.User = require('../models/mongodb/User');
    this.models.Blog = require('../models/mongodb/Blog');
    this.models.Category = require('../models/mongodb/Category');
    this.models.Tag = require('../models/mongodb/Tag');
    this.models.Comment = require('../models/mongodb/Comment');
    this.models.Like = require('../models/mongodb/Like');
  }

  getModels() {
    return this.models;
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
  }

  async dropDatabase() {
    if (this.connection && process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase();
      logger.info('MongoDB database dropped');
    }
  }
}

module.exports = MongoDatabase;