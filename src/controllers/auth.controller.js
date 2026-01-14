const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/email');
const logger = require('../utils/logger');

class AuthController {
  constructor(models) {
    this.User = models.User;
  }

  // Register new user
  async register(req, res, next) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await this.User.findOne({ 
        where: { email } 
      }).catch(() => this.User.findOne({ email }));

      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already registered' 
        });
      }

      // Create user
      const user = await this.User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        authProvider: 'local',
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      await user.save();

      // Send verification email
      if (process.env.NODE_ENV === 'production') {
        await emailService.sendVerificationEmail(email, username, verificationToken);
      } else {
        logger.info(`Verification token for ${email}: ${verificationToken}`);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Register error:', error);
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.User.findOne({ 
        where: { email } 
      }).catch(() => this.User.findOne({ email }));

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if email is verified (optional)
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email before logging in',
        });
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  // Verify email
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      const user = await this.User.findOne({ 
        where: { emailVerificationToken: token } 
      }).catch(() => this.User.findOne({ emailVerificationToken: token }));

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token',
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Verify email error:', error);
      next(error);
    }
  }

  // Resend verification email
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      const user = await this.User.findOne({ 
        where: { email } 
      }).catch(() => this.User.findOne({ email }));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified',
        });
      }

      // Generate new token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      await user.save();

      // Send email
      if (process.env.NODE_ENV === 'production') {
        await emailService.sendVerificationEmail(email, user.username, verificationToken);
      } else {
        logger.info(`Verification token for ${email}: ${verificationToken}`);
      }

      res.json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      next(error);
    }
  }

  // Forgot password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await this.User.findOne({ 
        where: { email } 
      }).catch(() => this.User.findOne({ email }));

      if (!user) {
        // Don't reveal if user exists
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent',
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // Send email
      if (process.env.NODE_ENV === 'production') {
        await emailService.sendPasswordResetEmail(email, user.username, resetToken);
      } else {
        logger.info(`Reset token for ${email}: ${resetToken}`);
      }

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const user = await this.User.findOne({ 
        where: { passwordResetToken: token } 
      }).catch(() => this.User.findOne({ passwordResetToken: token }));

      if (!user || user.passwordResetExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      user.password = newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.refreshToken = null; // Invalidate all sessions
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Find user
      const user = await this.User.findOne({ 
        where: { id: decoded.id } 
      }).catch(() => this.User.findById(decoded.id));

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const user = req.user;

      user.refreshToken = null;
      await user.save();

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  // Get current user
  async getMe(req, res, next) {
    try {
      res.json({
        success: true,
        data: {
          user: this.sanitizeUser(req.user),
        },
      });
    } catch (error) {
      logger.error('Get me error:', error);
      next(error);
    }
  }

  // Helper: Generate access token
  generateAccessToken(user) {
    const payload = {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    });
  }

  // Helper: Generate refresh token
  generateRefreshToken(user) {
    const payload = {
      id: user.id || user._id,
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });
  }

  // Helper: Sanitize user data
  sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    delete userData.emailVerificationToken;
    delete userData.passwordResetToken;
    delete userData.passwordResetExpires;
    delete userData.__v;
    return userData;
  }
}

module.exports = AuthController;