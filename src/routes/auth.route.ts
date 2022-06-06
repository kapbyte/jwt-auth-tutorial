import express from 'express';
const router = express.Router();

import { 
  userSignupController, 
  emailVerificationController, 
  loginController,
  forgotPasswordController,
  resetPasswordController
} from '../controllers/auth.controller';

router.post('/signup', userSignupController);
router.post('/verification', emailVerificationController);
router.post('/login', loginController);
router.put('/forgot-password', forgotPasswordController);
router.put('/reset-password/:token', resetPasswordController);

module.exports = router;