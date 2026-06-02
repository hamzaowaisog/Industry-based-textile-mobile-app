export type BiometricComponentProps = {
  userName: string | null;
  userEmail: string | null;
  initials: string;
  isPending: boolean;
  error: string | null;
  lastSyncMinutes: number;
  onAuthenticate: () => void;
  onSwitchAccount: () => void;
  onUsePassword: () => void;
};
