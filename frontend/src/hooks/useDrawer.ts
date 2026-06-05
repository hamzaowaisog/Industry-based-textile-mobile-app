import { useAuthStore } from '@stores/authStore';
import { useSyncStore } from '@stores/syncStore';

import { logoutAsync } from '../core/auth';

export const useDrawer = () => {
  const userName = useAuthStore((s) => s.userName);
  const roleId = useAuthStore((s) => s.roleId);
  const isOnline = useSyncStore((s) => s.isOnline);

  const onSignOut = async () => {
    await logoutAsync({ force: true });
  };

  return { userName, roleId, isOnline, onSignOut };
};
