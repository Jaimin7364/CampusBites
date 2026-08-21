import type { CookieOptions, Request, RequestHandler, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/api-response.js';

const refreshCookieName = 'campusbites_refresh';

function requestMetadata(request: Request) {
  const userAgent = request.get('user-agent');
  const ipAddress = request.ip;
  return {
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
  };
}

function cookieOptions(ttlDays: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: ttlDays * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(response: Response, token: string, ttlDays: number) {
  response.cookie(refreshCookieName, token, cookieOptions(ttlDays));
}

function clearRefreshCookie(response: Response) {
  response.clearCookie(refreshCookieName, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/auth',
  });
}

export const registerUser: RequestHandler = async (request, response) => {
  const body = request.body as {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  const result = await authService.register(
    {
      role: 'USER',
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
    },
    requestMetadata(request),
  );
  setRefreshCookie(response, result.refreshToken, result.refreshTokenTtlDays);
  sendSuccess(response, { user: result.user, accessToken: result.accessToken }, 201);
};

export const registerSeller: RequestHandler = async (request, response) => {
  const body = request.body as {
    sellerName: string;
    businessOwnerName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  const result = await authService.register(
    {
      role: 'SELLER',
      sellerName: body.sellerName,
      businessOwnerName: body.businessOwnerName,
      email: body.email,
      phone: body.phone,
      password: body.password,
    },
    requestMetadata(request),
  );
  setRefreshCookie(response, result.refreshToken, result.refreshTokenTtlDays);
  sendSuccess(response, { user: result.user, accessToken: result.accessToken }, 201);
};

export const login: RequestHandler = async (request, response) => {
  const { email, password, rememberMe } = request.body as {
    email: string;
    password: string;
    rememberMe: boolean;
  };
  const result = await authService.login(
    email,
    password,
    rememberMe,
    requestMetadata(request),
  );
  setRefreshCookie(response, result.refreshToken, result.refreshTokenTtlDays);
  sendSuccess(response, { user: result.user, accessToken: result.accessToken });
};

export const refresh: RequestHandler = async (request, response) => {
  const cookies: unknown = request.cookies;
  const token =
    typeof cookies === 'object' && cookies !== null && refreshCookieName in cookies
      ? (cookies as Record<string, unknown>)[refreshCookieName]
      : undefined;
  if (typeof token !== 'string') {
    throw new AppError(401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is required');
  }
  try {
    const result = await authService.rotateRefreshToken(token, requestMetadata(request));
    setRefreshCookie(response, result.refreshToken, result.refreshTokenTtlDays);
    sendSuccess(response, { user: result.user, accessToken: result.accessToken });
  } catch (error) {
    clearRefreshCookie(response);
    throw error;
  }
};

export const logout: RequestHandler = async (request, response) => {
  const cookies: unknown = request.cookies;
  const value =
    typeof cookies === 'object' && cookies !== null && refreshCookieName in cookies
      ? (cookies as Record<string, unknown>)[refreshCookieName]
      : undefined;
  await authService.logout(typeof value === 'string' ? value : undefined);
  clearRefreshCookie(response);
  sendSuccess(response, { message: 'Logged out successfully' });
};

export const forgotPassword: RequestHandler = async (request, response) => {
  const { email } = request.body as { email: string };
  await authService.requestPasswordReset(email);
  sendSuccess(response, {
    message: 'If an active account exists, password reset instructions have been sent',
  });
};

export const resetPassword: RequestHandler = async (request, response) => {
  const { token, password } = request.body as { token: string; password: string };
  await authService.resetPassword(token, password);
  clearRefreshCookie(response);
  sendSuccess(response, { message: 'Password reset successfully. Please log in again.' });
};

export const getMe: RequestHandler = async (request, response) => {
  const user = await authService.getProfile(request.auth!.userId);
  sendSuccess(response, { user });
};

export const updateMe: RequestHandler = async (request, response) => {
  const user = await authService.updateProfile(
    request.auth!.userId,
    request.auth!.role,
    request.body as never,
  );
  sendSuccess(response, { user });
};

export const changePassword: RequestHandler = async (request, response) => {
  const { currentPassword, password } = request.body as {
    currentPassword: string;
    password: string;
  };
  await authService.changePassword(request.auth!.userId, currentPassword, password);
  clearRefreshCookie(response);
  sendSuccess(response, { message: 'Password changed successfully. Please log in again.' });
};
