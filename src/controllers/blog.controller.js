const logger = require('../utils/logger');
const { Op } = require('sequelize');

class BlogController {
  constructor(models) {
    this.Blog = models.Blog;
    this.User = models.User;
    this.Category = models.Category;
    this.Tag = models.Tag;
    this.Like = models.Like;
    this.Comment = models.Comment;
  }

  // Get all blogs with pagination, filtering, and search
  async getAllBlogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        tag,
        author,
        search,
        sort = '-createdAt',
        featured,
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const include = [];

      // Build where clause
      if (status) where.status = status;
      if (featured) where.isFeatured = featured === 'true';
      
      // Search
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Category filter
      if (category) {
        where.categoryId = category;
      }

      // Include associations
      include.push(
        { model: this.User, as: 'author', attributes: ['id', 'username', 'avatar', 'firstName', 'lastName'] },
        { model: this.Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] },
        { model: this.Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
      );

      // Sorting
      const order = [];
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
      order.push([sortField, sortOrder]);

      // For MongoDB
      if (this.Blog.find) {
        const query = {};
        if (status) query.status = status;
        if (featured) query.isFeatured = featured === 'true';
        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (author) query.author = author;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ];
        }

        const total = await this.Blog.countDocuments(query);
        const blogs = await this.Blog.find(query)
          .populate('author', 'username avatar firstName lastName')
          .populate('category', 'name slug color')
          .populate('tags', 'name slug')
          .sort(sort)
          .skip(offset)
          .limit(parseInt(limit));

        return res.json({
          success: true,
          data: {
            blogs,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              pages: Math.ceil(total / limit),
            },
          },
        });
      }

      // For PostgreSQL
      const { count, rows } = await this.Blog.findAndCountAll({
        where,
        include,
        order,
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      res.json({
        success: true,
        data: {
          blogs: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Get all blogs error:', error);
      next(error);
    }
  }

// Get single blog by slug
async getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    let blog;
    
    // Foolproof database detection - check for Sequelize-specific method
    const isSequelize = typeof this.Blog.findByPk === 'function';
    
    if (isSequelize) {
      // PostgreSQL (Sequelize)
      blog = await this.Blog.findOne({
        where: { slug, status: 'published' },
        include: [
          { 
            model: this.User, 
            as: 'author', 
            attributes: ['id', 'username', 'avatar', 'firstName', 'lastName', 'bio'] 
          },
          { 
            model: this.Category, 
            as: 'category',
            attributes: ['id', 'name', 'slug', 'color', 'description']
          },
          { 
            model: this.Tag, 
            as: 'tags', 
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] } 
          },
        ],
      });
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }
      
      // Increment view count for PostgreSQL
      await blog.increment('viewCount');
      await blog.reload(); // Reload to get the updated viewCount
      
    } else {
      // MongoDB (Mongoose)
      blog = await this.Blog.findOne({ slug, status: 'published' })
        .populate('author', 'username avatar firstName lastName bio')
        .populate('category', 'name slug color description')
        .populate('tags', 'name slug');
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }
      
      // Increment view count for MongoDB
      blog.viewCount += 1;
      await blog.save();
    }

    res.json({
      success: true,
      data: { blog },
    });
  } catch (error) {
    logger.error('Get blog by slug error:', error);
    next(error);
  }
}

  // Create new blog
async createBlog(req, res, next) {
  try {
    const { title, content, excerpt, category, tags, status, featuredImage } = req.body;
    const userId = req.user.id || req.user._id;

    const isSequelize = typeof this.Blog.findByPk === 'function';

    if (isSequelize) {
      // PostgreSQL (Sequelize)
      
      // Find or create category if provided
      let categoryId = null;
      if (category) {
        const [categoryInstance] = await this.Category.findOrCreate({
          where: { name: category.toLowerCase().trim() },
          defaults: { 
            name: category.toLowerCase().trim(),
          }
        });
        categoryId = categoryInstance.id;
      }

      // Create the blog
      const blog = await this.Blog.create({
        title,
        content,
        excerpt,
        categoryId,
        userId,
        status: status || 'draft',
        featuredImage,
      });

      // Handle tags if provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagInstances = [];
        
        for (const tagName of tags) {
          const [tag] = await this.Tag.findOrCreate({
            where: { name: tagName.toLowerCase().trim() },
            defaults: { 
              name: tagName.toLowerCase().trim(),
            }
          });
          tagInstances.push(tag);
        }
        
        await blog.setTags(tagInstances);
      }

      // Reload blog with associations
      const createdBlog = await this.Blog.findByPk(blog.id, {
        include: [
          { model: this.User, as: 'author', attributes: ['id', 'username', 'avatar'] },
          { model: this.Category, as: 'category', required: false },
          { model: this.Tag, as: 'tags', through: { attributes: [] } },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: { blog: createdBlog },
      });

    } else {
      // MongoDB (Mongoose)
      
      let categoryId = null;
      if (category) {
        let categoryDoc = await this.Category.findOne({ name: category.toLowerCase().trim() });
        
        if (!categoryDoc) {
          categoryDoc = await this.Category.create({ name: category.toLowerCase().trim() });
        }
        
        categoryId = categoryDoc._id;
      }

      const tagIds = [];
      if (tags && Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          let tag = await this.Tag.findOne({ name: tagName.toLowerCase().trim() });
          
          if (!tag) {
            tag = await this.Tag.create({ name: tagName.toLowerCase().trim() });
          }
          
          tagIds.push(tag._id);
        }
      }

      const blog = await this.Blog.create({
        title,
        content,
        excerpt,
        category: categoryId,
        author: userId,
        tags: tagIds,
        status: status || 'draft',
        featuredImage,
      });

      const createdBlog = await this.Blog.findById(blog._id)
        .populate('author', 'username avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug');

      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: { blog: createdBlog },
      });
    }
  } catch (error) {
    logger.error('Create blog error:', error);
    next(error);
  }
}

  // Update blog
  async updateBlog(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id || req.user._id;
      const updates = req.body;

      // Find blog
      let blog;
      if (this.Blog.findById) {
        blog = await this.Blog.findById(id);
      } else {
        blog = await this.Blog.findByPk(id);
      }

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }

      // Check ownership (unless admin)
      const blogAuthorId = blog.userId || blog.author?.toString();
      if (blogAuthorId !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this blog',
        });
      }

      // Update blog
      Object.assign(blog, updates);
      
      // Handle tags for PostgreSQL
      if (updates.tags && blog.setTags) {
        await blog.setTags(updates.tags);
      }

      await blog.save();

      // Reload with associations
      if (blog.reload) {
        await blog.reload({
          include: [
            { model: this.User, as: 'author', attributes: ['id', 'username', 'avatar'] },
            { model: this.Category, as: 'category' },
            { model: this.Tag, as: 'tags', through: { attributes: [] } },
          ],
        });
      } else {
        await blog.populate('author category tags');
      }

      res.json({
        success: true,
        message: 'Blog updated successfully',
        data: { blog },
      });
    } catch (error) {
      logger.error('Update blog error:', error);
      next(error);
    }
  }

  // Delete blog
  async deleteBlog(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id || req.user._id;

      // Find blog
      let blog;
      if (this.Blog.findById) {
        blog = await this.Blog.findById(id);
      } else {
        blog = await this.Blog.findByPk(id);
      }

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }

      // Check ownership
      const blogAuthorId = blog.userId || blog.author?.toString();
      if (blogAuthorId !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this blog',
        });
      }

      // Delete
      if (blog.deleteOne) {
        await blog.deleteOne();
      } else {
        await blog.destroy();
      }

      res.json({
        success: true,
        message: 'Blog deleted successfully',
      });
    } catch (error) {
      logger.error('Delete blog error:', error);
      next(error);
    }
  }

  // Like/Unlike blog
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id || req.user._id;

      // Find existing like
      let existingLike;
      if (this.Like.findOne && this.Like.findOne.length === 1) {
        existingLike = await this.Like.findOne({ blog: id, user: userId });
      } else {
        existingLike = await this.Like.findOne({ where: { blogId: id, userId } });
      }

      if (existingLike) {
        // Unlike
        if (existingLike.deleteOne) {
          await existingLike.deleteOne();
        } else {
          await existingLike.destroy();
        }

        // Decrement count
        if (this.Blog.findByIdAndUpdate) {
          await this.Blog.findByIdAndUpdate(id, { $inc: { likeCount: -1 } });
        } else {
          const blog = await this.Blog.findByPk(id);
          blog.likeCount -= 1;
          await blog.save();
        }

        return res.json({
          success: true,
          message: 'Blog unliked',
          data: { liked: false },
        });
      }

      // Like
      const likeData = this.Like.create && this.Like.create.length === 1
        ? { blog: id, user: userId }
        : { blogId: id, userId };

      await this.Like.create(likeData);

      // Increment count
      if (this.Blog.findByIdAndUpdate) {
        await this.Blog.findByIdAndUpdate(id, { $inc: { likeCount: 1 } });
      } else {
        const blog = await this.Blog.findByPk(id);
        blog.likeCount += 1;
        await blog.save();
      }

      res.json({
        success: true,
        message: 'Blog liked',
        data: { liked: true },
      });
    } catch (error) {
      logger.error('Toggle like error:', error);
      next(error);
    }
  }

  // Get user's blogs
  async getMyBlogs(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      let blogs, total;

      if (this.Blog.find) {
        // MongoDB
        const query = { author: userId, ...where };
        total = await this.Blog.countDocuments(query);
        blogs = await this.Blog.find(query)
          .populate('category', 'name slug color')
          .populate('tags', 'name slug')
          .sort('-createdAt')
          .skip(offset)
          .limit(parseInt(limit));
      } else {
        // PostgreSQL
        where.userId = userId;
        const result = await this.Blog.findAndCountAll({
          where,
          include: [
            { model: this.Category, as: 'category' },
            { model: this.Tag, as: 'tags', through: { attributes: [] } },
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(limit),
          offset,
        });
        blogs = result.rows;
        total = result.count;
      }

      res.json({
        success: true,
        data: {
          blogs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Get my blogs error:', error);
      next(error);
    }
  }
}

module.exports = BlogController;