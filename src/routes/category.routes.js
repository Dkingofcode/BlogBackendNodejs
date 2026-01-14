// const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validation');

// function createCategoryRoutes(categoryController, authMiddleware) {
//   const router = express.Router();

//   router.get('/', categoryController.getAllCategories.bind(categoryController));

//   router.post('/',
//     authMiddleware.authenticate(),
//     authMiddleware.authorize('admin'),
//     [
//       body('name').trim().notEmpty(),
//       validate,
//     ],
//     categoryController.createCategory.bind(categoryController)
//   );

//   router.put('/:id',
//     authMiddleware.authenticate(),
//     authMiddleware.authorize('admin'),
//     categoryController.updateCategory.bind(categoryController)
//   );

//   router.delete('/:id',
//     authMiddleware.authenticate(),
//     authMiddleware.authorize('admin'),
//     categoryController.deleteCategory.bind(categoryController)
//   );

//   return router;
// }

// module.exports = createCategoryRoutes;






const express = require('express');

function createCategoryRoutes(categoryController, authMiddleware) {
  const router = express.Router();

  // Public routes
  router.get('/', categoryController.getAllCategories.bind(categoryController));
  router.post('/', categoryController.createCategory.bind(categoryController));
  router.put('/:id', categoryController.updateCategory.bind(categoryController));
  router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

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

module.exports = createCategoryRoutes;



















