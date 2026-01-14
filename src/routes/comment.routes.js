// const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validation');

// function createCommentRoutes(commentController, authMiddleware) {
//   const router = express.Router();

//   router.get('/blog/:blogId', commentController.getCommentsByBlog.bind(commentController));

//   router.post('/blog/:blogId',
//     authMiddleware.authenticate(),
//     [
//       body('content').trim().isLength({ min: 1, max: 1000 }),
//       validate,
//     ],
//     commentController.createComment.bind(commentController)
//   );

//   router.put('/:id',
//     authMiddleware.authenticate(),
//     [
//       body('content').trim().isLength({ min: 1, max: 1000 }),
//       validate,
//     ],
//     commentController.updateComment.bind(commentController)
//   );

//   router.delete('/:id',
//     authMiddleware.authenticate(),
//     commentController.deleteComment.bind(commentController)
//   );

//   return router;
// }

// module.exports = createCommentRoutes;







const express = require('express');

function createCommentRoutes(commentController, authMiddleware) {
  const router = express.Router();

  // Public routes
  router.get('/:blogId', commentController.getCommentsByBlog.bind(commentController));
  router.post('/:blogId', authMiddleware.authenticate(), commentController.createComment.bind(commentController));
  router.put('/:id', authMiddleware.authenticate(), commentController.updateComment.bind(commentController));
  router.delete('/:id', authMiddleware.authenticate(), commentController.deleteComment.bind(commentController));


  // Protected routes
//   router.post('/logout', 
//     authMiddleware.authenticate(), 
//     authController.logout.bind(authController)
//   );
  
//   router.get('/me', 
//     authMiddleware.authenticate(), 
//     authController.getMe.bind(authController)
//   );

  return router;
}

module.exports = createCommentRoutes;




