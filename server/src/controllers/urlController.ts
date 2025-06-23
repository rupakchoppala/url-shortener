import { Request, Response ,NextFunction} from 'express';
import Url from '../models/Url';
import { generateShortCode } from '../utils/generateShortCode';
import dns from 'dns/promises';
import { AppError } from '../middleware/errorHandler';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function isPublicUrl(url: string): Promise<boolean> {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (
        addr.address.startsWith('10.') ||
        addr.address.startsWith('172.') ||
        addr.address.startsWith('192.168.') ||
        addr.address === '127.0.0.1' ||
        addr.address === '::1'
      ) return false;
    }
    return true;
  } catch {
    return false;
  }
}
export const shortUrl = async (req: Request, res: Response, next: NextFunction) => {
  const { longUrl, customAlias } = req.body;
  const userId = (req.user as { id: string })?.id;
    if (!userId) return res.status(401).json({ msg: 'User not authenticated' });

  try {
    // if (!longUrl || !isValidUrl(longUrl)) {
    //   return next(new AppError('Invalid URL format', 400));
    // }

    // if (!(await isPublicUrl(longUrl))) {
    //   return next(new AppError('URL is not allowed (private or local address)', 400));
    // }

    let shortCode: string;
    let existing;

    if (customAlias) {
      if (!/^[a-zA-Z0-9_-]{3,10}$/.test(customAlias)) {
        return next(new AppError('Invalid custom alias format', 400));
      }

      existing = await Url.findOne({ shortCode: customAlias });
      if (existing) return next(new AppError('Custom alias already in use', 409));

      shortCode = customAlias;
    } else {
      do {
        shortCode = generateShortCode();
        existing = await Url.findOne({ shortCode });
      } while (existing);
    }

    const shortUrl = `${BASE_URL}/${shortCode}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newUrl = new Url({ longUrl, shortCode, shortUrl, expiresAt,userId });
    await newUrl.save();
    res.status(201).json(newUrl);
  } catch (err) {
    next(new AppError('Server Error', 500));
  }
};


export const redirectUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) return next(new AppError('Short URL not found', 404));

    if (url.expiresAt && url.expiresAt < new Date()) {
      return next(new AppError('This short URL has expired.', 410));
    }

    url.clicks += 1;

    // Push the current timestamp to clickTimestamps array
    url.clickTimestamps = url.clickTimestamps || [];  // Initialize if undefined
    url.clickTimestamps.push(new Date());

    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    next(new AppError('Server Error', 500));
  }
};


export const getUrlStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) return next(new AppError('Short URL not found', 404));

    res.status(200).json({
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      clickTimestamps: url.clickTimestamps, // <-- send timestamps here
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
    });
  } catch (err) {
    next(new AppError('Server Error', 500));
  }
};



export const getAllUrls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id;
    if (!userId) return res.status(401).json({ msg: 'User not authenticated' });
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(urls);
  } catch (err) {
    next(new AppError('Error fetching URLs', 500));
  }
};

export const getUrlByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return next(new AppError('Short URL not found', 404));
    }

    res.status(200).json({
      longUrl: url.longUrl,
      shortUrl: url.shortUrl,
      shortCode:url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
    });
  } catch (error) {
    next(new AppError('Failed to retrieve short URL info', 500));
  }
};
export const updateUrl = async (req: Request, res: Response, next: NextFunction) => {
  const { shortCode } = req.params;
  const { longUrl } = req.body;


  try {
    // if (!newLongUrl || !isValidUrl(newLongUrl)) {
    //   return next(new AppError('Invalid new URL format', 400));
    // }

    // if (!(await isPublicUrl(newLongUrl))) {
    //   return next(new AppError('New URL is not allowed (private/local address)', 400));
    // }

    const url = await Url.findOne({ shortCode });
    if (!url) return next(new AppError('Short URL not found', 404));
    if (url.expiresAt && url.expiresAt < new Date()) {
      return next(new AppError('Cannot edit an expired URL.', 403));
    }

    url.longUrl = longUrl;
    await url.save();

    res.status(200).json({ message: 'URL updated successfully', updatedUrl: url });
  } catch (err) {
    console.error(err);
    next(new AppError('Failed to update URL', 500));
  }
};

export const deleteUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const deleted = await Url.findOneAndDelete({ shortCode });

    if (!deleted) return next(new AppError('Short URL not found', 404));

    res.status(200).json({ message: 'Short URL deleted successfully' });
  } catch (err) {
    next(new AppError('Error deleting URL', 500));
  }
};




