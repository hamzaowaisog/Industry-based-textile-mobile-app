import { useAuthStore } from '@stores/authStore';

import { logoutAsync } from '../core/auth';

export const useDrawer = () => {
  const userName = useAuthStore((s) => s.userName);
  const roleId = useAuthStore((s) => s.roleId);

  const onSignOut = async () => {
    await logoutAsync();
  };

  return { userName, roleId, onSignOut };
};
