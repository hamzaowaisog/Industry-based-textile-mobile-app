import { settingsGet, settingsUpdate } from '@api/generated/settings/settings';
import type { SettingsDto } from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import i18n from '@utils/i18n';

export const fetchSettingsAsync = async (): Promise<{
  success: boolean;
  hijriOffsetDays?: number;
  error?: string;
}> => {
  try {
    const res = await settingsGet();
    const r = parseApiResponse<SettingsDto>(res, i18n.t('common.errorGeneric'));
    if (!r.success || !r.data) return { success: false, error: r.error };
    return { success: true, hijriOffsetDays: r.data.hijriOffsetDays ?? 0 };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const updateHijriOffsetAsync = async (
  hijriOffsetDays: number,
): Promise<{ success: boolean; hijriOffsetDays?: number; error?: string }> => {
  try {
    const res = await settingsUpdate({ hijriOffsetDays });
    const r = parseApiResponse<SettingsDto>(res, i18n.t('common.errorGeneric'));
    if (!r.success || !r.data) return { success: false, error: r.error };
    return { success: true, hijriOffsetDays: r.data.hijriOffsetDays ?? 0 };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};
