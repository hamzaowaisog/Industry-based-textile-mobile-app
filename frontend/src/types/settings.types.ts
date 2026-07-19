export type ProfileCardProps = {
  userName: string | null;
  userEmail: string | null;
  roleLabel: string;
  isAdmin: boolean;
};

export type SettingsComponentProps = {
  userName: string | null;
  userEmail: string | null;
  roleLabel: string;
  isAdmin: boolean;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  isBiometricPending: boolean;
  isNotificationsEnabled: boolean;
  isNotificationsPending: boolean;
  appVersion: string;
  onMenuPress: () => void;
  onChangePassword: () => void;
  onResendConfirmation: () => void;
  isResendingConfirmation: boolean;
  onToggleBiometric: (value: boolean) => void;
  onToggleNotifications: (value: boolean) => void;
  onSignOut: () => void;
};
