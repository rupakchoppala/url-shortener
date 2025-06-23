import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JwtPayload {
    id: string;
  }
  
  export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: "Unauthorized" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
      req.user = { id: decoded.id };
      next();
    } catch (err) {
      return res.status(401).json({ msg: "Invalid token" });
    }
  };
  
