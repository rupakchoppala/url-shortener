import express from 'express';
import { Request, Response,NextFunction } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { shortUrl,redirectUrl,getUrlStats, getAllUrls, deleteUrl, updateUrl, getUrlByCode } from '../controllers/urlController';
const router = express.Router();
import rateLimit from "express-rate-limit";

// Allow max 5 requests per 1 minute per IP
const createUrlLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

router.post('/shorten',(req: Request, res: Response ,next:NextFunction) => {
  authMiddleware(req, res,next);
}, (req: Request, res: Response ,next:NextFunction) => {
    shortUrl(req, res,next);
  });
router.get('/:shortCode',createUrlLimiter, (req: Request, res: Response,next:NextFunction) => {
    redirectUrl(req, res,next);
  });
  router.get('/:shortCode/stats', (req: Request, res: Response,next:NextFunction) => {
    getUrlStats(req, res,next);
  });
  router.get('/',(req: Request, res: Response ,next:NextFunction) => {
    authMiddleware(req, res,next);
  }, (req: Request, res: Response,next:NextFunction) => {
    getAllUrls(req, res,next);
  });
  router.get('/info/:shortCode', (req: Request, res: Response,next:NextFunction) => {
    getUrlByCode(req, res,next);
  });  
  router.put('/:shortCode', (req: Request, res: Response,next:NextFunction) => {
    updateUrl(req, res,next);
  });  
  router.delete('/:shortCode', (req: Request, res: Response,next:NextFunction) => {
    deleteUrl(req, res,next);
  });
export default router;