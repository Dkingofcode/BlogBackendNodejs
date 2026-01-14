const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthMiddleware {
  constructor(models) {
    this.User = models.User;
  }

  authenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Access token required',
          });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = this.User.findById
          ? await this.User.findById(decoded.id)
          : await this.User.findByPk(decoded.id);

        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token or user not found',
          });
        }

        req.user = user;
        next();
      } catch (error) {
        logger.error('Auth middleware error:', error);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
    };
  }

  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      next();
    };
  }

  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          const user = this.User.findById
            ? await this.User.findById(decoded.id)
            : await this.User.findByPk(decoded.id);

          if (user && user.isActive) {
            req.user = user;
          }
        }
        next();
      } catch (error) {
        next();
      }
    };
  }
}

module.exports = AuthMiddleware;
