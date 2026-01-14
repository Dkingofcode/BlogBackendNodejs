const logger = require('../utils/logger');

class CommentController {
  constructor(models) {
    this.Comment = models.Comment;
    this.Blog = models.Blog;
  }

  async getCommentsByBlog(req, res, next) {
    try {
      const { blogId } = req.params;

      let comments;
      if (this.Comment.find) {
        comments = await this.Comment.find({ blog: blogId, parent: null })
          .populate('user', 'username avatar')
          .populate({
            path: 'replies',
            populate: { path: 'user', select: 'username avatar' }
          })
          .sort('-createdAt');
      } else {
        comments = await this.Comment.findAll({
          where: { blogId, parentId: null },
          include: [
            { model: this.Comment, as: 'replies', include: ['user'] },
            'user'
          ],
          order: [['createdAt', 'DESC']],
        });
      }

      res.json({
        success: true,
        data: { comments },
      });
    } catch (error) {
      logger.error('Get comments error:', error);
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const { blogId } = req.params;
      const { content, parentId } = req.body;
      const userId = req.user.id || req.user._id;

      const commentData = { content };
      if (this.Comment.create && this.Comment.create.length === 1) {
        commentData.blog = blogId;
        commentData.user = userId;
        if (parentId) commentData.parent = parentId;
      } else {
        commentData.blogId = blogId;
        commentData.userId = userId;
        if (parentId) commentData.parentId = parentId;
      }

      const comment = await this.Comment.create(commentData);

      // Increment blog comment count
      if (this.Blog.findByIdAndUpdate) {
        await this.Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });
      } else {
        const blog = await this.Blog.findByPk(blogId);
        blog.commentCount += 1;
        await blog.save();
      }

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: { comment },
      });
    } catch (error) {
      logger.error('Create comment error:', error);
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id || req.user._id;

      const comment = this.Comment.findById
        ? await this.Comment.findById(id)
        : await this.Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      const commentUserId = comment.userId || comment.user?.toString();
      if (commentUserId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }

      comment.content = content;
      comment.isEdited = true;
      await comment.save();

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: { comment },
      });
    } catch (error) {
      logger.error('Update comment error:', error);
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id || req.user._id;

      const comment = this.Comment.findById
        ? await this.Comment.findById(id)
        : await this.Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      const commentUserId = comment.userId || comment.user?.toString();
      if (commentUserId !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }

      const blogId = comment.blogId || comment.blog;
      comment.deleteOne ? await comment.deleteOne() : await comment.destroy();

      // Decrement blog comment count
      if (this.Blog.findByIdAndUpdate) {
        await this.Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: -1 } });
      } else {
        const blog = await this.Blog.findByPk(blogId);
        blog.commentCount -= 1;
        await blog.save();
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      logger.error('Delete comment error:', error);
      next(error);
    }
  }
}

module.exports = CommentController;