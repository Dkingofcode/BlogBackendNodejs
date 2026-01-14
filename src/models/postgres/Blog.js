const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const Blog = sequelize.define('Blog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200],
      },
    },
    slug: {
      type: DataTypes.STRING(250),
      unique: true,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 100000],
      },
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id', // Explicitly map to snake_case
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id', // Explicitly map to snake_case
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count',
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count',
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'comment_count',
    },
    readingTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'reading_time',
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
    },
    metaTitle: {
      type: DataTypes.STRING(70),
      allowNull: true,
      field: 'meta_title',
    },
    metaDescription: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: 'meta_description',
    },
    metaKeywords: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'meta_keywords',
    },
  }, {
    tableName: 'blogs',
    timestamps: true,
    underscored: true, // This tells Sequelize to use snake_case
    indexes: [
      { fields: ['slug'] },
      { fields: ['user_id'] }, // Use snake_case in indexes
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['published_at'] },
      { fields: ['is_featured'] },
    ],
  });

  // Generate slug before validate
  Blog.beforeValidate(async (blog) => {
    if (blog.title && (!blog.slug || blog.changed('title'))) {
      let baseSlug = slugify(blog.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Check for existing slug
      const existingBlog = await Blog.findOne({ where: { slug } });
      if (existingBlog && existingBlog.id !== blog.id) {
        while (await Blog.findOne({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      blog.slug = slug;
    }

    // Calculate reading time
    if (blog.content) {
      const wordCount = blog.content.trim().split(/\s+/).length;
      blog.readingTime = Math.ceil(wordCount / 200);
    }

    // Auto-generate excerpt
    if (!blog.excerpt && blog.content) {
      const plainText = blog.content.replace(/<[^>]*>/g, '');
      blog.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }
  });

  // Set publishedAt when status changes to published
  Blog.beforeUpdate(async (blog) => {
    if (blog.changed('status') && blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
  });

  return Blog;
};