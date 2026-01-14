// const express = require('express');
// const { body, query } = require('express-validator');
// const validate = require('../middleware/validation');

// function createBlogRoutes(blogController, authMiddleware) {
//   const router = express.Router();

//   router.get('/', [
//     query('page').optional().isInt({ min: 1 }),
//     query('limit').optional().isInt({ min: 1, max: 100 }),
//     validate,
//   ], blogController.getAllBlogs.bind(blogController));

//   router.get('/my-blogs', 
//     authMiddleware.authenticate(),
//     blogController.getMyBlogs.bind(blogController)
//   );

//   router.get('/:slug', blogController.getBlogBySlug.bind(blogController));

//   router.post('/', 
//     authMiddleware.authenticate(),
//     authMiddleware.authorize('author', 'admin'),
//     [
//       body('title').trim().isLength({ min: 3, max: 200 }),
//       body('content').isLength({ min: 10 }),
//       validate,
//     ],
//     blogController.createBlog.bind(blogController)
//   );

//   router.put('/:id',
//     authMiddleware.authenticate(),
//     authMiddleware.authorize('author', 'admin'),
//     blogController.updateBlog.bind(blogController)
//   );

//   router.delete('/:id',
//     authMiddleware.authenticate(),
//     authMiddleware.authorize('author', 'admin'),
//     blogController.deleteBlog.bind(blogController)
//   );

//   router.post('/:id/like',
//     authMiddleware.authenticate(),
//     blogController.toggleLike.bind(blogController)
//   );

//   return router;
// }

// module.exports = createBlogRoutes;







const express = require('express');



function createBlogRoutes(blogController, authMiddleware) {
  const router = express.Router();

  // Public routes
  router.get('/my-blogs', authMiddleware.authenticate(), blogController.getMyBlogs.bind(blogController));
  router.get('/', blogController.getAllBlogs.bind(blogController));
  router.get('/:slug', blogController.getBlogBySlug.bind(blogController));
  router.post('/', authMiddleware.authenticate(), blogController.createBlog.bind(blogController));
  router.put('/:id', authMiddleware.authenticate(), blogController.updateBlog.bind(blogController));
  router.delete('/:id', authMiddleware.authenticate(), blogController.deleteBlog.bind(blogController));
  router.post('/:id/like', authMiddleware.authenticate(), blogController.toggleLike.bind(blogController));



  return router;
}

module.exports = createBlogRoutes;



























