export const AppConstants = {
  // Secure store keys
  SECURE_STORE: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    ROLE_ID: 'roleId',
    USER_NAME: 'userName',
  },

  // Roles
  ROLES: {
    ADMIN: 1,
    STAFF: 2,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
  },

  // Sync
  SYNC: {
    MAX_RETRY_COUNT: 3,
  },

  // Date format
  DATE_FORMAT: 'dd MMM, yyyy',
};
