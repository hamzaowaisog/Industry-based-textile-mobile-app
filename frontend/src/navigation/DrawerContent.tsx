import { DrawerContentComponentProps } from '@react-navigation/drawer';

import { DrawerComponent } from '@components/drawer';

import { useDrawer } from '@hooks/useDrawer';

import { AppConstants } from '@constants/appConstants';

export const DrawerContent = ({ state, navigation }: DrawerContentComponentProps) => {
  const { userName, roleId, onSignOut } = useDrawer();

  const activeRoute = state.routes[state.index]?.name ?? '';

  const handleNav = (routeId: string) => {
    navigation.navigate(routeId);
  };
  const handleSettings = () => {
    navigation.navigate(AppConstants.SCREENS.MAIN.SETTINGS);
  };
  const handleSignOut = async () => {
    navigation.closeDrawer();
    await onSignOut();
  };

  return (
    <DrawerComponent
      activeRoute={activeRoute}
      userName={userName}
      roleId={roleId}
      onNavigate={handleNav}
      onSettings={handleSettings}
      onSignOut={handleSignOut}
    />
  );
};
