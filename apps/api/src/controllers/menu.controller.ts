import type { RequestHandler } from 'express';
import * as service from '../services/menu.service.js';
import { sendSuccess } from '../utils/api-response.js';

const id = (request: Express.Request) => (request.validatedParams as { id: string }).id;
export const listPublic: RequestHandler = async (request, response) => { const { hotelId } = request.validatedParams as { hotelId: string }; sendSuccess(response, await service.listPublicMenu(hotelId, request.validatedQuery as never)); };
export const listSeller: RequestHandler = async (request, response) => { sendSuccess(response, await service.listSellerMenu(request.auth!.userId, request.validatedQuery as never)); };
export const create: RequestHandler = async (request, response) => { sendSuccess(response, { menuItem: await service.createMenuItem(request.auth!.userId, request.body as never) }, 201); };
export const update: RequestHandler = async (request, response) => { sendSuccess(response, { menuItem: await service.updateMenuItem(request.auth!.userId, id(request), request.body as never) }); };
export const availability: RequestHandler = async (request, response) => { const { available } = request.body as { available: boolean }; sendSuccess(response, { menuItem: await service.setAvailability(request.auth!.userId, id(request), available) }); };
export const bestseller: RequestHandler = async (request, response) => { const { bestseller: value } = request.body as { bestseller: boolean }; sendSuccess(response, { menuItem: await service.setBestseller(request.auth!.userId, id(request), value) }); };
export const reorder: RequestHandler = async (request, response) => { const { items } = request.body as { items: { id: string; displayOrder: number }[] }; sendSuccess(response, { menuItems: await service.reorderMenu(request.auth!.userId, items) }); };
export const remove: RequestHandler = async (request, response) => { await service.deleteMenuItem(request.auth!.userId, id(request)); response.status(204).send(); };
