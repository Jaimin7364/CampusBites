import { ApiClientError } from '@/services/api-client';

type ValidationDetails = { fields?: Record<string, string[] | undefined>; formErrors?: string[] };

export function getApiError(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  return 'Unable to reach CampusBites. Please try again.';
}

export function getFieldErrors(error: unknown) {
  if (!(error instanceof ApiClientError) || !error.details) return {};
  const details = error.details as ValidationDetails;
  return Object.fromEntries(
    Object.entries(details.fields ?? {}).map(([field, messages]) => [field, messages?.[0] ?? 'Invalid value']),
  );
}
