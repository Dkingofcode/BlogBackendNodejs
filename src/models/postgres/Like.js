const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'blog_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
  }, {
    tableName: 'likes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['blog_id', 'user_id'],
      },
    ],
  });

  return Like;
};