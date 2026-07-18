import type { UserDto } from '@api/models';

import { AppConstants } from '@constants/appConstants';

import type { UserDetail, UserRow } from '../../types/users.types';
import { getInitials } from './textHelpers';

export const resolveRoleName = (roleId: number): string =>
  roleId === AppConstants.ROLES.ADMIN ? 'Admin' : 'Staff';

export const mapApiUserToRow = (d: UserDto): UserRow => {
  const name = d.name ?? '';
  const roleId = d.roleId ?? AppConstants.ROLES.STAFF;
  return {
    id: d.id ?? 0,
    name,
    email: d.email ?? '',
    userName: d.userName ?? '',
    roleId,
    roleName: resolveRoleName(roleId),
    isActive: d.isActive ?? false,
    initials: getInitials(name),
  };
};

export const mapApiUserToDetail = (d: UserDto): UserDetail => {
  const roleId = d.roleId ?? AppConstants.ROLES.STAFF;
  return {
    id: d.id ?? 0,
    name: d.name ?? '',
    email: d.email ?? '',
    userName: d.userName ?? '',
    roleId,
    roleName: resolveRoleName(roleId),
    phoneNumber: d.phoneNumber ?? null,
    isActive: d.isActive ?? false,
    createdAt: d.createdAt ?? null,
  };
};
