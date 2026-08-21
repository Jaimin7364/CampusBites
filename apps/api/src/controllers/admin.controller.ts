import type { RequestHandler } from 'express';
import * as service from '../services/admin.service.js';
import { sendSuccess } from '../utils/api-response.js';

const id = (request: Express.Request) => (request.validatedParams as { id: string }).id;
export const users: RequestHandler = async (request, response) => { sendSuccess(response, await service.listUsers(request.validatedQuery as never)); };
export const user: RequestHandler = async (request, response) => { sendSuccess(response, { user: await service.getUser(id(request)) }); };
export const sellers: RequestHandler = async (request, response) => { sendSuccess(response, await service.listSellers(request.validatedQuery as never)); };
export const seller: RequestHandler = async (request, response) => { sendSuccess(response, { seller: await service.getSeller(id(request)) }); };
export const orders: RequestHandler = async (request, response) => { sendSuccess(response, await service.listOrders(request.validatedQuery as never)); };
export const order: RequestHandler = async (request, response) => { sendSuccess(response, { order: await service.getOrder(id(request)) }); };
export const dashboard: RequestHandler = async (_request, response) => { sendSuccess(response, await service.getDashboard()); };
