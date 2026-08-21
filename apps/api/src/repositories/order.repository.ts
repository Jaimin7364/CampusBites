import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
export function findByIdempotency(userId: string, idempotencyKey: string) { return prisma.order.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } }, include: { items: true } }); }
export function findById(id: string) { return prisma.order.findUnique({ where: { id }, include: { items: true } }); }
export function create(data: Prisma.OrderCreateInput) { return prisma.$transaction(async (tx) => tx.order.create({ data, include: { items: true } })); }
