import type { RequestHandler } from 'express';
import * as cartService from '../services/cart.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const preview: RequestHandler = async (request, response) => {
  sendSuccess(response, await cartService.previewCart(request.body as cartService.CartPreviewInput));
};
