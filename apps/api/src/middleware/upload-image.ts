import multer from 'multer';
import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
  fileFilter: (_request, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new AppError(422, 'INVALID_IMAGE_TYPE', 'Use a JPEG, PNG, or WebP image'));
      return;
    }
    callback(null, true);
  },
}).single('image');

export const uploadOutletImage: RequestHandler = (request, response, next) => {
  upload(request, response, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const messages: Partial<Record<typeof error.code, string>> = {
        LIMIT_FILE_SIZE: 'Image must be 5 MB or smaller',
        LIMIT_FILE_COUNT: 'Upload only one image',
        LIMIT_UNEXPECTED_FILE: 'Upload exactly one file using the image field',
        LIMIT_FIELD_COUNT: 'Text fields are not accepted in this upload',
        LIMIT_PART_COUNT: 'Upload only one image without additional form fields',
      };
      next(new AppError(422, 'INVALID_IMAGE_UPLOAD', messages[error.code] ?? 'The image upload is invalid'));
      return;
    }
    next(error);
  });
};
