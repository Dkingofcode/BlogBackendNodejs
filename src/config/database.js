// const { Sequelize } = require("sequelize");

// const env = process.env.NODE_ENV || "development";

// const dbName = env === "test" ? process.env.TEST_DB_NAME : process.env.DB_NAME;


// const sequelize = new Sequelize(
//   dbName,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT || "postgres",
//     logging: false,
//   }
// );

// module.exports = sequelize;













const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

class PostgresDatabase {
  constructor() {
    this.sequelize = null;
    this.models = {};
  }

  async connect() {
    try {
      const config = {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          underscored: true,
        },
      };

      const dbName = process.env.NODE_ENV === 'test' 
        ? process.env.POSTGRES_DB_TEST 
        : process.env.POSTGRES_DB;

      this.sequelize = new Sequelize(
        dbName,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD,
        config
      );

      await this.sequelize.authenticate();
      logger.info('PostgreSQL connection established successfully');

      // Initialize models
      this.initializeModels();

      // Sync database (in development only)
      if (process.env.NODE_ENV === 'development') {
        await this.sequelize.sync({ alter: true });
        logger.info('PostgreSQL models synchronized');
      }

      return this.sequelize;
    } catch (error) {
      logger.error('Unable to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  initializeModels() {
    // Import models - FIXED PATHS
    const User = require('../models/postgres/User')(this.sequelize);
    const Blog = require('../models/postgres/Blog')(this.sequelize);
    const Category = require('../models/postgres/Category')(this.sequelize);
    const Tag = require('../models/postgres/Tag')(this.sequelize);
    const Comment = require('../models/postgres/Comment')(this.sequelize);
    const Like = require('../models/postgres/Like')(this.sequelize);

    // Define associations
    this.setupAssociations({ User, Blog, Category, Tag, Comment, Like });

    this.models = { User, Blog, Category, Tag, Comment, Like };
  }

  setupAssociations(models) {
    const { User, Blog, Category, Tag, Comment, Like } = models;

    // User <-> Blog (one-to-many)
    User.hasMany(Blog, { foreignKey: 'userId', as: 'blogs' });
    Blog.belongsTo(User, { foreignKey: 'userId', as: 'author' });

    // Blog <-> Category (many-to-one)
    Category.hasMany(Blog, { foreignKey: 'categoryId', as: 'blogs' });
    Blog.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

    // Blog <-> Tag (many-to-many)
    Blog.belongsToMany(Tag, { through: 'BlogTags', as: 'tags' });
    Tag.belongsToMany(Blog, { through: 'BlogTags', as: 'blogs' });

    // Blog <-> Comment (one-to-many)
    Blog.hasMany(Comment, { foreignKey: 'blogId', as: 'comments' });
    Comment.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });

    // User <-> Comment (one-to-many)
    User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
    Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Comment self-referential (replies)
    Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
    Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

    // Blog <-> Like (one-to-many)
    Blog.hasMany(Like, { foreignKey: 'blogId', as: 'likes' });
    Like.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });

    // User <-> Like (one-to-many)
    User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
    Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }

  getModels() {
    return this.models;
  }

  async disconnect() {
    if (this.sequelize) {
      await this.sequelize.close();
      logger.info('PostgreSQL connection closed');
    }
  }

  async dropDatabase() {
    if (this.sequelize && process.env.NODE_ENV === 'test') {
      await this.sequelize.drop();
      logger.info('PostgreSQL database dropped');
    }
  }
}

module.exports = PostgresDatabase;