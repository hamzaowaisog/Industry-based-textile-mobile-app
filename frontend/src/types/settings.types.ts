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
  hijriOffsetDays: number;
  isHijriOffsetSaving: boolean;
  onMenuPress: () => void;
  onChangePassword: () => void;
  onResendConfirmation: () => void;
  isResendingConfirmation: boolean;
  onToggleBiometric: (value: boolean) => void;
  onToggleNotifications: (value: boolean) => void;
  onIncrementHijriOffset: () => void;
  onDecrementHijriOffset: () => void;
  onSignOut: () => void;
};

export type HijriOffsetStepperProps = {
  hijriOffsetDays: number;
  saving: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};
