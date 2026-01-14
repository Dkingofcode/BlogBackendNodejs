// const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validation');

// function createUserRoutes(userController, authMiddleware) {
//   const router = express.Router();

//   router.get('/profile',
//     authMiddleware.authenticate(),
//     userController.getProfile.bind(userController)
//   );

//   router.put('/profile',
//     authMiddleware.authenticate(),
//     userController.updateProfile.bind(userController)
//   );

//   router.put('/change-password',
//     authMiddleware.authenticate(),
//     [
//       body('currentPassword').notEmpty(),
//       body('newPassword').isLength({ min: 8 }),
//       validate,
//     ],
//     userController.changePassword.bind(userController)
//   );

//   return router;
// }

// module.exports = createUserRoutes;




// const express = require("express");
// const router = express.Router();

// const { getProfile, updateProfile, changePassword } = require("../controllers/user.controller");

// router.get("/profile", getProfile);
// router.put("/profile", updateProfile);
// router.post("/change-password", changePassword);

// module.exports = router;





const express = require('express');

function createUserRoutes(userController, authMiddleware) {
  const router = express.Router();

  // Public routes
  router.get('/profile', authMiddleware.authenticate(), userController.getProfile.bind(userController));
  router.put('/profile', authMiddleware.authenticate(), userController.updateProfile.bind(userController));
  router.post('/change-password', authMiddleware.authenticate(), userController.changePassword.bind(userController));
 
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

module.exports = createUserRoutes;











