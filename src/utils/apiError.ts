import axios from 'axios';

/**
 * Extracts a human-readable error message from an Axios error.
 * Priority: response.data.errors[0] → response.data.message → fallback
 */
export function extractApiError(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors[0];
    if (data?.message) return data.message;
    if (err.message) return err.message;
  }
  return fallback;
}
