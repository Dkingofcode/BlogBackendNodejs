const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(60),
      unique: true,
      allowNull: false,
    },
  }, {
    tableName: 'tags',
    timestamps: true,
  });

  Tag.beforeValidate(async (tag) => {
    if (tag.name && !tag.slug) {
      tag.slug = slugify(tag.name, { lower: true, strict: true });
    }
  });

  return Tag;
};