const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
let accessToken: string | null = null;
let refreshRequest: Promise<string | null> | null = null;

type ApiSuccess<T> = { success: true; data: T; requestId?: string };
type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
  requestId?: string;
};

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || !body.success) {
    const failure = body as ApiFailure;
    throw new ApiClientError(
      response.status,
      failure.error?.code ?? 'REQUEST_FAILED',
      failure.error?.message ?? 'The request failed',
      failure.error?.details,
    );
  }

  return body.data;
}

export function apiClient<T>(path: string, init: RequestInit = {}) {
  return request<T>(path, init);
}

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = request<{ accessToken: string }>('/auth/refresh', { method: 'POST' })
      .then((data) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

export async function authenticatedApiClient<T>(path: string, init: RequestInit = {}) {
  if (!accessToken) await refreshAccessToken();
  try {
    return await request<T>(path, init, accessToken);
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
    const token = await refreshAccessToken();
    if (!token) throw error;
    return request<T>(path, init, token);
  }
}
