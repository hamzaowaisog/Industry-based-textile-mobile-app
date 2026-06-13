import type { ApiResponse } from '../../types/api.types';

export const parseApiError = (err: unknown, fallback: string): string => {
  const data = (err as any)?.response?.data;
  return data?.errors?.[0] ?? data?.message ?? fallback;
};

export const parseApiResponse = <T>(
  res: unknown,
  fallback: string,
): { success: boolean; data?: T; error?: string } => {
  const r = res as ApiResponse<T>;
  if (!r?.success) {
    return { success: false, error: r?.errors?.[0] ?? r?.message ?? fallback };
  }
  return { success: true, data: r.data };
};
