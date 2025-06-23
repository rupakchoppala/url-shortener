import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import urlRoutes from './routes/url';
import { redirectUrl } from './controllers/urlController';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';

import { Response,Request } from 'express';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // ✅ must be explicit
  credentials: true                // ✅ allow credentials (cookies)
}));
app.use(express.json());

// LOGGING middleware to track all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Test redirect route first
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.use('/api/url', urlRoutes); // For API actions (POST shorten)
app.use('/', urlRoutes); // For GET /:shortCode

app.get('/', (_req, res) => {
  res.send('URL Shortener API running!');
});
// Error middleware should go last
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
  });
