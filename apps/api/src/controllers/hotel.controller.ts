import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import * as hotelService from '../services/hotel.service.js';
import { imageStorage } from '../services/image-storage.service.js';
import { sendSuccess } from '../utils/api-response.js';

const idFrom = (request: Express.Request) => (request.validatedParams as { id: string }).id;

export const getMine: RequestHandler = async (request, response) => {
  const hotel = await hotelService.getSellerHotel(request.auth!.userId);
  sendSuccess(response, { hotel });
};
export const createMine: RequestHandler = async (request, response) => {
  const hotel = await hotelService.createSellerHotel(request.auth!.userId, request.body as never);
  sendSuccess(response, { hotel }, 201);
};
export const updateMine: RequestHandler = async (request, response) => {
  const hotel = await hotelService.updateSellerHotel(request.auth!.userId, idFrom(request), request.body as never);
  sendSuccess(response, { hotel });
};
export const resubmitMine: RequestHandler = async (request, response) => {
  const hotel = await hotelService.resubmitSellerHotel(request.auth!.userId, idFrom(request));
  sendSuccess(response, { hotel });
};
export const listAdmin: RequestHandler = async (request, response) => {
  const result = await hotelService.listAdminHotels(request.validatedQuery as Parameters<typeof hotelService.listAdminHotels>[0]);
  sendSuccess(response, result);
};
export const listPublic: RequestHandler = async (request, response) => {
  sendSuccess(response, await hotelService.listPublicHotels(request.validatedQuery as hotelService.PublicHotelFilters));
};
export const getPublic: RequestHandler = async (request, response) => {
  sendSuccess(response, { hotel: await hotelService.getPublicHotel(idFrom(request)) });
};
export const getAdmin: RequestHandler = async (request, response) => {
  sendSuccess(response, { hotel: await hotelService.getAdminHotel(idFrom(request)) });
};
export const approve: RequestHandler = async (request, response) => {
  sendSuccess(response, { hotel: await hotelService.approveHotel(request.auth!.userId, idFrom(request)) });
};
export const reject: RequestHandler = async (request, response) => {
  const { reason } = request.body as { reason: string };
  sendSuccess(response, { hotel: await hotelService.rejectHotel(idFrom(request), reason) });
};
export const feature: RequestHandler = async (request, response) => {
  const { featured } = request.body as { featured: boolean };
  sendSuccess(response, { hotel: await hotelService.setFeatured(idFrom(request), featured) });
};
export const updateAdmin: RequestHandler = async (request, response) => {
  sendSuccess(response, { hotel: await hotelService.updateAdminHotel(idFrom(request), request.body as never) });
};
export const updateActive: RequestHandler = async (request, response) => {
  const { active } = request.body as { active: boolean };
  sendSuccess(response, { hotel: await hotelService.setHotelActive(idFrom(request), active) });
};
export const removeAdmin: RequestHandler = async (request, response) => {
  await hotelService.deleteHotel(idFrom(request));
  response.status(204).send();
};
export const uploadImage: RequestHandler = async (request, response) => {
  if (!request.file) throw new AppError(422, 'IMAGE_REQUIRED', 'Upload an image in the image field');
  const url = await imageStorage.saveOutletImage(request.file);
  sendSuccess(response, { url }, 201);
};
