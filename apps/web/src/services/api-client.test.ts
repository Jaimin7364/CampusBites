import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiClientError,
  apiClient,
  authenticatedApiClient,
  setAccessToken,
} from './api-client';

describe('apiClient', () => {
  afterEach(() => {
    setAccessToken(null);
    vi.restoreAllMocks();
  });

  it('unwraps a successful API response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { status: 'up' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(apiClient('/health')).resolves.toEqual({ status: 'up' });
  });

  it('accepts a successful response with no content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiClient('/admin/universities/id', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws a typed API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: { code: 'NOPE', message: 'Nope' } }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const request = apiClient('/failure');
    await expect(request).rejects.toBeInstanceOf(ApiClientError);
    await expect(request).rejects.toMatchObject({
      status: 400,
      code: 'NOPE',
      message: 'Nope',
    });
  });

  it('refreshes once and retries an expired authenticated request', async () => {
    setAccessToken('expired-token');
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Expired' },
          }),
          { status: 401, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ success: true, data: { accessToken: 'fresh-token' } }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { user: { id: 'user-1' } } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    await expect(authenticatedApiClient('/auth/me')).resolves.toEqual({
      user: { id: 'user-1' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(new Headers(fetchMock.mock.calls[2]?.[1]?.headers).get('authorization')).toBe(
      'Bearer fresh-token',
    );
  });
});
