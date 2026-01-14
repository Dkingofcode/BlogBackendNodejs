const logger = require('../utils/logger');


class CategoryController {
  constructor(models) {
    this.Category = models.Category;
    this.Blog = models.Blog;
  }

  async getAllCategories(req, res, next) {
    try {
      const categories = this.Category.find 
        ? await this.Category.find().sort('name')
        : await this.Category.findAll({ order: [['name', 'ASC']] });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      logger.error('Get categories error:', error);
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { name, description, color } = req.body;

      const category = await this.Category.create({
        name,
        description,
        color,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      logger.error('Create category error:', error);
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const category = this.Category.findById
        ? await this.Category.findById(id)
        : await this.Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      Object.assign(category, updates);
      await category.save();

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      logger.error('Update category error:', error);
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const category = this.Category.findById
        ? await this.Category.findById(id)
        : await this.Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      category.deleteOne ? await category.deleteOne() : await category.destroy();

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      logger.error('Delete category error:', error);
      next(error);
    }
  }
}

module.exports = CategoryController;