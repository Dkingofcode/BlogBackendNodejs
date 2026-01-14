const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50],
        isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'last_name',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'author', 'admin'),
      defaultValue: 'user',
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google', 'github'),
      defaultValue: 'local',
      field: 'auth_provider',
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'google_id',
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'github_id',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_email_verified',
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'email_verification_token',
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'password_reset_token',
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_expires',
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['role'] },
    ],
  });

  // Hash password before create
  User.beforeCreate(async (user) => {
    if (user.password) {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      user.password = await bcrypt.hash(user.password, rounds);
    }
  });

  // Hash password before update
  User.beforeUpdate(async (user) => {
    if (user.changed('password') && user.password) {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      user.password = await bcrypt.hash(user.password, rounds);
    }
  });

  // Instance method to compare password
  User.prototype.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Instance method to get public profile
  User.prototype.toPublicJSON = function() {
    const { password, refreshToken, emailVerificationToken, passwordResetToken, ...publicData } = this.toJSON();
    return publicData;
  };

  return User;
};