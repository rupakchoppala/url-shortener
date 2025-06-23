import Url from '../models/Url.js';
import { generateShortCode } from '../utils/generateShortCode.js';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
export const shortUrl = async (req, res) => {
    const { longUrl } = req.body;
    try {
        if (!longUrl || !/^https?:\/\/.+/.test(longUrl)) {
            return res.status(400).json({ message: 'Invalid URL format' });
        }
        let shortCode;
        let existing;
        do {
            shortCode = generateShortCode();
            existing = await Url.findOne({ shortCode });
        } while (existing);
        const shortUrl = `${BASE_URL}/${shortCode}`;
        const newUrl = new Url({ longUrl, shortCode, shortUrl });
        await newUrl.save();
        res.status(201).json(newUrl);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
