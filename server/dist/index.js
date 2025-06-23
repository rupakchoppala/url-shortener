import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import urlRoutes from './routes/url.js'; // 👈 Must be Router
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get('/', (_req, res) => {
    res.send('URL Shortener API running!');
});
console.log('urlRoutes is:', typeof urlRoutes);
app.use('/api/url', urlRoutes); // ✅ This line should get a Router, not a function!
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
