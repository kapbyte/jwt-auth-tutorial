import express from 'express';
const router = express.Router();

import { 
  userSignupController, 
  emailVerificationController, 
  loginController,
  forgotPasswordController,
  resetPasswordController
} from '../controllers/auth.controller';

router.post('/api/signup', userSignupController);
router.post('/api/verification', emailVerificationController);
router.post('/api/login', loginController);
router.put('/api/forgot-password', forgotPasswordController);
router.put('/api/reset-password/:token', resetPasswordController);

module.exports = router;