// const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validation');

// function createAuthRoutes(authController, authMiddleware) {
//   const router = express.Router();

//   /**
//    * @swagger
//    * /api/auth/register:
//    *   post:
//    *     summary: Register a new user
//    *     tags: [Auth]
//    *     requestBody:
//    *       required: true
//    *       content:
//    *         application/json:
//    *           schema:
//    *             type: object
//    *             required:
//    *               - username
//    *               - email
//    *               - password
//    *             properties:
//    *               username:
//    *                 type: string
//    *               email:
//    *                 type: string
//    *               password:
//    *                 type: string
//    *               firstName:
//    *                 type: string
//    *               lastName:
//    *                 type: string
//    *     responses:
//    *       201:
//    *         description: User registered successfully
//    */
//   router.post('/register', [
//     body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
//     body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
//     body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
//     validate,
//   ], authController.register.bind(authController));

//   /**
//    * @swagger
//    * /api/auth/login:
//    *   post:
//    *     summary: Login user
//    *     tags: [Auth]
//    */
//   router.post('/login', [
//     body('email').isEmail().normalizeEmail(),
//     body('password').notEmpty(),
//     validate,
//   ], authController.login.bind(authController));

//   router.post('/verify-email', [
//     body('token').notEmpty(),
//     validate,
//   ], authController.verifyEmail.bind(authController));

//   router.post('/resend-verification', [
//     body('email').isEmail().normalizeEmail(),
//     validate,
//   ], authController.resendVerification.bind(authController));

//   router.post('/forgot-password', [
//     body('email').isEmail().normalizeEmail(),
//     validate,
//   ], authController.forgotPassword.bind(authController));

//   router.post('/reset-password', [
//     body('token').notEmpty(),
//     body('newPassword').isLength({ min: 8 }),
//     validate,
//   ], authController.resetPassword.bind(authController));

//   router.post('/refresh-token', [
//     body('refreshToken').notEmpty(),
//     validate,
//   ], authController.refreshToken.bind(authController));

//   router.post('/logout', 
//     authMiddleware.authenticate(), 
//     authController.logout.bind(authController)
//   );

//   router.get('/me', 
//     authMiddleware.authenticate(), 
//     authController.getMe.bind(authController)
//   );

//   return router;
// }

// module.exports = createAuthRoutes;












const express = require('express');

function createAuthRoutes(authController, authMiddleware) {
  const router = express.Router();

  // Public routes
  router.post('/register', authController.register.bind(authController));
  router.post('/login', authController.login.bind(authController));
  router.post('/verify-email', authController.verifyEmail.bind(authController));
  router.post('/resend-verification', authController.resendVerification.bind(authController));
  router.post('/forgot-password', authController.forgotPassword.bind(authController));
  router.post('/reset-password', authController.resetPassword.bind(authController));
  router.post('/refresh-token', authController.refreshToken.bind(authController));

  // Protected routes
  router.post('/logout', 
    authMiddleware.authenticate(), 
    authController.logout.bind(authController)
  );
  
  router.get('/me', 
    authMiddleware.authenticate(), 
    authController.getMe.bind(authController)
  );

  return router;
}

module.exports = createAuthRoutes;