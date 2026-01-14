const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_edited',
    },
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
  });

  return Comment;
};