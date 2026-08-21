import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { AppError } from '../errors/app-error.js';

export interface ImageStorage {
  saveOutletImage(file: Express.Multer.File): Promise<string>;
}

const uploadDirectory = fileURLToPath(new URL('../../uploads/outlets/', import.meta.url));
const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

class LocalImageStorage implements ImageStorage {
  async saveOutletImage(file: Express.Multer.File) {
    const extension = extensions[file.mimetype];
    const isJpeg = file.buffer.length >= 3 && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    const isPng = file.buffer.length >= 8 && file.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = file.buffer.length >= 12 && file.buffer.toString('ascii', 0, 4) === 'RIFF' && file.buffer.toString('ascii', 8, 12) === 'WEBP';
    const signatureMatches = (file.mimetype === 'image/jpeg' && isJpeg) || (file.mimetype === 'image/png' && isPng) || (file.mimetype === 'image/webp' && isWebp);
    if (!extension || !signatureMatches) throw new AppError(422, 'INVALID_IMAGE_CONTENT', 'The uploaded file content does not match its image type');
    await mkdir(uploadDirectory, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(new URL(fileName, `file://${uploadDirectory}/`), file.buffer, { flag: 'wx' });
    return `/uploads/outlets/${fileName}`;
  }
}

export const imageStorage: ImageStorage = new LocalImageStorage();
export const uploadsRoot = fileURLToPath(new URL('../../uploads/', import.meta.url));
