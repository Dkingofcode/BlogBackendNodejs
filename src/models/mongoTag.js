const mongoose = require('mongoose');
const slugify = require('slugify');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

tagSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Tag', tagSchema);
EOF

cat > src/models/mongodb/Comment.js << 'EOF'
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

commentSchema.index({ blog: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
EOF

cat > src/models/mongodb/Like.js << 'EOF'
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

likeSchema.index({ blog: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);