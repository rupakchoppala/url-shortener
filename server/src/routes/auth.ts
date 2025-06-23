import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import passport from 'passport';
const router = express.Router();
async function registerUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ msg: 'User created', user: newUser });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err });
  }
}

router.post('/register', (req:Request,res:Response)=>{
  registerUser(req,res);
});
async function LoginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: false });
    res.json({ msg: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err });
  }
}
router.post('/login',  (req:Request,res:Response)=>{
  LoginUser(req,res);
});

router.get('/me',  (req: Request, res: Response) => {
  async()=>{
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: 'Unauthorized', error: err });
  }
}
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req: Request, res: Response) => {
    if (!req.user) return res.redirect('/');

    // @ts-ignore
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || '', { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: false });
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

export default router;
