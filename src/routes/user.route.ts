import express from 'express';
const router = express.Router();
import { verifyAuthToken } from '../middlewares/verify.token';

import { 
  bookHistoryController
} from '../controllers/user.controller';

router.get('/api/book-history', verifyAuthToken, bookHistoryController);

module.exports = router;