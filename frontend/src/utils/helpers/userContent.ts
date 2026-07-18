import { AppConstants } from '@constants/appConstants';

import type { RoleOption, UserFilterOption } from '../../types/users.types';

export const USER_FILTER_OPTIONS: UserFilterOption[] = [
  { value: 'all', labelKey: 'users.filterAll' },
  { value: 'admin', labelKey: 'users.filterAdmin' },
  { value: 'staff', labelKey: 'users.filterStaff' },
];

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: AppConstants.ROLES.ADMIN,
    labelKey: 'users.roleAdmin',
    descKey: 'users.roleAdminDesc',
  },
  {
    id: AppConstants.ROLES.STAFF,
    labelKey: 'users.roleStaff',
    descKey: 'users.roleStaffDesc',
  },
];
