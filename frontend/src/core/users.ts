import {
  usersAdminCreateUser,
  usersDeleteUserById,
  usersGetAllUsers,
  usersGetUserById,
  usersSetUserActive,
} from '@api/generated/users/users';
import type { UserCreateViewModel, UserDto } from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import { mapApiUserToDetail, mapApiUserToRow } from '@utils/helpers/userMappers';
import i18n from '@utils/i18n';

import type { UserDetail, UserRow } from '../types/users.types';

export const fetchUsersAsync = async (): Promise<UserRow[]> => {
  try {
    const res = await usersGetAllUsers();
    const r = parseApiResponse<UserDto[]>(res, '');
    if (!r.success || !r.data) return [];
    return r.data.map(mapApiUserToRow);
  } catch {
    return [];
  }
};

export const fetchUserByIdAsync = async (id: number): Promise<UserDetail | null> => {
  try {
    const res = await usersGetUserById(id);
    const r = parseApiResponse<UserDto>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiUserToDetail(r.data);
  } catch {
    return null;
  }
};

export const createUserAsync = async (
  values: UserCreateViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await usersAdminCreateUser(values);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const setUserActiveAsync = async (
  id: number,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await usersSetUserActive(id, { isActive });
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const deleteUserAsync = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await usersDeleteUserById(id);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};
