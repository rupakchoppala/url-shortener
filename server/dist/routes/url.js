import express from 'express';
import { shortUrl } from '../controllers/urlController.js';
const router = express.Router();
router.post('/shorten', shortUrl);
export default router;
