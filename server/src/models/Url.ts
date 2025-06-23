// src/models/Url.ts
import mongoose, { Schema } from 'mongoose';

const urlSchema = new Schema({
  longUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  shortUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  clickTimestamps: [{ type: Date }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  // ✅ Add userId as a reference to User model
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Url = mongoose.model('Url', urlSchema);
export default Url;
