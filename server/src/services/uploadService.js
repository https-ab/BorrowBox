import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';
import { isCloudinaryConfigured } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/** Uploads a buffer to Cloudinary when configured, otherwise to local disk. */
export async function uploadImage(file) {
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'borrowbox', resource_type: 'image', transformation: [{ width: 1200, crop: 'limit' }] },
        (error, result) => (error ? reject(error) : resolve(result.secure_url))
      );
      stream.end(file.buffer);
    });
  }

  // Local fallback - served statically from /uploads
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  return `/uploads/${filename}`;
}

export { UPLOAD_DIR };
