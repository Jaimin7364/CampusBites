import type { RequestHandler } from 'express';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import * as service from '../services/seller-order.service.js';
import { sendSuccess } from '../utils/api-response.js';

const id = (request: Express.Request) => (request.validatedParams as { id: string }).id;
export const list: RequestHandler = async (request, response) => { sendSuccess(response, await service.listSellerOrders(request.auth!.userId, request.validatedQuery as never)); };
export const detail: RequestHandler = async (request, response) => { sendSuccess(response, { order: await service.getSellerOrder(request.auth!.userId, id(request)) }); };
export const status: RequestHandler = async (request, response) => { const body = request.body as { status: OrderStatus }; sendSuccess(response, { order: await service.changeStatus(request.auth!.userId, id(request), body.status) }); };
export const paymentStatus: RequestHandler = async (request, response) => { const body = request.body as { paymentStatus: PaymentStatus }; void body; sendSuccess(response, { order: await service.markPaymentPaid(request.auth!.userId, id(request)) }); };
export const summary: RequestHandler = async (request, response) => { sendSuccess(response, await service.getSellerOrderSummary(request.auth!.userId)); };
