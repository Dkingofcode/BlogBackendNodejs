const logger = require('../utils/logger');

class UserController {
  constructor(models) {
    this.User = models.User;
  }

  async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        data: { user: this.sanitizeUser(req.user) },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, bio, avatar } = req.body;
      const user = req.user;

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (bio) user.bio = bio;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: this.sanitizeUser(user) },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  }

  sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    delete userData.emailVerificationToken;
    delete userData.passwordResetToken;
    delete userData.__v;
    return userData;
  }
}

module.exports = UserController;