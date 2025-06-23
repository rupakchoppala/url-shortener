// src/models/Url.ts
import mongoose from 'mongoose';
const urlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Url = mongoose.model('Url', urlSchema);
export default Url; // ✅ Explicit default export
