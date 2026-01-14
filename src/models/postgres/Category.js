const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(120),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#3B82F6',
    },
  }, {
    tableName: 'categories',
    timestamps: true,
  });

  Category.beforeValidate(async (category) => {
    if (category.name && !category.slug) {
      category.slug = slugify(category.name, { lower: true, strict: true });
    }
  });

  return Category; // FIXED: Return Category, not CategoryModel
};