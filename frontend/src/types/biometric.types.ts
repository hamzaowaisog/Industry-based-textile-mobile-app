export type BiometricComponentProps = {
  userName: string | null;
  userEmail: string | null;
  initials: string;
  isPending: boolean;
  isOnline: boolean;
  error: string | null;
  onAuthenticate: () => void;
  onSwitchAccount: () => void;
  onUsePassword: () => void;
};
