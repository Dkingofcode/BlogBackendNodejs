const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('express-async-errors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/error');

// Controllers
const AuthController = require('./controllers/auth.controller');
const BlogController = require('./controllers/blog.controller');
const CategoryController = require('./controllers/category.controller');
const CommentController = require('./controllers/comment.controller');
const UserController = require('./controllers/user.controller');

// Middleware
const AuthMiddleware = require('./middleware/auth');

// Routes

// const authRoutes = require("./routes/auth.routes");
// const blogRoutes = require("./routes/blog.routes");
// const catgoryRoutes = require("./routes/category.routes");
// const commentRoutes = require("./routes/comment.routes");
// const userRoutes = require("./routes/user.routes");





 const createAuthRoutes = require('./routes/auth.routes');
 const createBlogRoutes = require('./routes/blog.routes');
 const createCategoryRoutes = require('./routes/category.routes');
 const createCommentRoutes = require('./routes/comment.routes');
 const createUserRoutes = require('./routes/user.routes');



function createApp(models) {
  const app = express();

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // CORS
  const corsOptions = {
    origin: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173').split(','),
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // Compression
  app.use(compression());

  // Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }));
  }

  // Rate Limiting
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        success: false,
        message: 'Too many requests, please try again later',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use('/api', limiter);
  }

  // Swagger Documentation
  if (process.env.ENABLE_SWAGGER === 'true') {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Blog Backend API',
          version: '1.0.0',
          description: 'Production-grade blog backend with PostgreSQL and MongoDB support',
          contact: {
            name: 'API Support',
            email: process.env.ADMIN_EMAIL,
          },
        },
        servers: [
          {
            url: process.env.NODE_ENV === 'production' 
              ? `https://your-domain.com/api/${process.env.API_VERSION || 'v1'}`
              : `http://localhost:${process.env.PORT || 5000}/api/${process.env.API_VERSION || 'v1'}`,
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [{
          bearerAuth: [],
        }],
      },
      apis: ['./src/routes/*.js'],
    };

    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Blog API Documentation',
    }));
  }

  // Health Check
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_TYPE,
      environment: process.env.NODE_ENV,
    });
  });

  // Initialize Controllers
  const authController = new AuthController(models);
  const blogController = new BlogController(models);
  const categoryController = new CategoryController(models);
  const commentController = new CommentController(models);
  const userController = new UserController(models);

  // Initialize Middleware
  const authMiddleware = new AuthMiddleware(models);

  // API Routes
  const apiVersion = process.env.API_VERSION || 'v1';
  app.use(`/api/${apiVersion}/auth`, createAuthRoutes(authController, authMiddleware));
  app.use(`/api/${apiVersion}/blogs`, createBlogRoutes(blogController, authMiddleware));
  app.use(`/api/${apiVersion}/categories`, createCategoryRoutes(categoryController, authMiddleware));
  app.use(`/api/${apiVersion}/comments`, createCommentRoutes(commentController, authMiddleware));
  app.use(`/api/${apiVersion}/users`, createUserRoutes(userController, authMiddleware));

  // Image Upload Route
  const upload = require('./middleware/upload');
  const cloudinary = require('./utils/cloudinary');

  app.post(`/api/${apiVersion}/upload`, 
    authMiddleware.authenticate(),
    upload.single('image'),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No file uploaded',
          });
        }

        const result = await cloudinary.uploadImage(req.file);

        res.json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            url: result.url,
            publicId: result.publicId,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );




  // 404 Handler
  app.use(notFound);

  // Error Handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;