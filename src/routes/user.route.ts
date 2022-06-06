import express from 'express';
const router = express.Router();
import { verifyAuthToken } from '../middlewares/verify.token';

import { 
  userInfoController
} from '../controllers/user.controller';

router.get('/info', verifyAuthToken, userInfoController);

module.exports = router;