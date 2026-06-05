import { DrawerContentComponentProps } from '@react-navigation/drawer';

import { DrawerComponent } from '@components/drawer';
import { AppConstants } from '@constants/appConstants';
import { useDrawer } from '@hooks/useDrawer';

export const DrawerContent = ({ state, navigation }: DrawerContentComponentProps) => {
  const { userName, roleId, isOnline, onSignOut } = useDrawer();

  const activeRoute = state.routes[state.index]?.name ?? '';

  const handleNav = (routeId: string) => { navigation.navigate(routeId); };
  const handleSettings = () => { navigation.navigate(AppConstants.SCREENS.MAIN.SETTINGS); };
  const handleSignOut = async () => {
    navigation.closeDrawer();
    await onSignOut();
  };

  return (
    <DrawerComponent
      activeRoute={activeRoute}
      userName={userName}
      roleId={roleId}
      isOnline={isOnline}
      onNavigate={handleNav}
      onSettings={handleSettings}
      onSignOut={handleSignOut}
    />
  );
};
