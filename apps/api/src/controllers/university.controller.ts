import type { RequestHandler } from 'express';
import * as universityService from '../services/university.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const listPublic: RequestHandler = async (request, response) => {
  const result = await universityService.listPublicUniversities(
    request.validatedQuery as Parameters<typeof universityService.listPublicUniversities>[0],
  );
  sendSuccess(response, result);
};

export const listAdmin: RequestHandler = async (request, response) => {
  const result = await universityService.listUniversities(
    request.validatedQuery as Parameters<typeof universityService.listUniversities>[0],
  );
  sendSuccess(response, result);
};

export const getAdminDetail: RequestHandler = async (request, response) => {
  const { id } = request.validatedParams as { id: string };
  const university = await universityService.getUniversity(id);
  sendSuccess(response, { university });
};

export const create: RequestHandler = async (request, response) => {
  const university = await universityService.createUniversity(request.body as never);
  sendSuccess(response, { university }, 201);
};

export const update: RequestHandler = async (request, response) => {
  const { id } = request.validatedParams as { id: string };
  const university = await universityService.updateUniversity(
    id,
    request.body as never,
  );
  sendSuccess(response, { university });
};

export const updateStatus: RequestHandler = async (request, response) => {
  const { id } = request.validatedParams as { id: string };
  const { active } = request.body as { active: boolean };
  const university = await universityService.setUniversityStatus(id, active);
  sendSuccess(response, { university });
};

export const remove: RequestHandler = async (request, response) => {
  const { id } = request.validatedParams as { id: string };
  await universityService.deleteUniversity(id);
  response.status(204).send();
};
