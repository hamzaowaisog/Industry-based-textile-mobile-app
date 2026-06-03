export const AppConstants = {
  // App identity
  APP: {
    NAME: 'HamzaTex',
    TAG: 'TEXTILE ERP',
  },

  // Secure store keys (auth tokens only — non-sensitive prefs use FILES)
  SECURE_STORE: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    ROLE_ID: 'roleId',
    USER_NAME: 'userName',
    EMAIL: 'userEmail',
    BIOMETRIC_TOKEN: 'biometricToken',
  },

  // File-system markers (cleared on reinstall, unlike Keychain)
  FILES: {
    ONBOARDING_COMPLETED: 'onboarding_completed',
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
    STORE_KEY: 'hamzatex-sync-store',
  },

  // Local DB
  DB: {
    NAME: 'hamzatex.db',
  },

  // Date format
  DATE_FORMAT: 'dd MMM, yyyy',

  // OTP
  OTP: {
    LENGTH: 6,
  },

  // Screen names
  SCREENS: {
    AUTH: {
      WELCOME: 'Welcome',
      ONBOARDING: 'Onboarding',
      LOGIN: 'Login',
      FORGOT_PASSWORD: 'ForgotPassword',
      VERIFY_OTP: 'VerifyOtp',
      RESET_PASSWORD: 'ResetPassword',
      REGISTER: 'Register',
      VERIFY_SIGNUP_OTP: 'VerifySignupOtp',
      BIOMETRIC: 'Biometric',
      TERMS: 'Terms',
      PRIVACY: 'Privacy',
    },
  } as const,
} as const;
