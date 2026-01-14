const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    maxlength: 500,
  },
  featuredImage: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  readingTime: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
}, {
  timestamps: true,
});

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text' });

// Generate slug before validate
blogSchema.pre('validate', async function(next) {
  if (this.title && (this.isNew || this.isModified('title'))) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Calculate reading time
  if (this.content) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  // Auto-generate excerpt
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }

  next();
});

// Set publishedAt when publishing
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;