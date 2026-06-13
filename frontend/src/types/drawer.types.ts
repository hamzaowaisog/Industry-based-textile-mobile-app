export type NavItemRowProps = {
  item: DrawerNavItem;
  isActive: boolean;
  onPress: () => void;
};

export type DrawerComponentProps = {
  activeRoute: string;
  userName: string | null;
  roleId: number | null;
  onNavigate: (routeId: string) => void;
  onSettings: () => void;
  onSignOut: () => Promise<void>;
};

export type DrawerIconName =
  | 'home'
  | 'users'
  | 'shopping-bag'
  | 'box'
  | 'truck'
  | 'credit-card'
  | 'file-text'
  | 'receipt'
  | 'tag'
  | 'coins'
  | 'bar-chart'
  | 'user'
  | 'settings'
  | 'log-out';

export type DrawerNavItem = {
  id: string;
  labelKey: string;
  icon: DrawerIconName;
  adminOnly?: boolean;
};

export type DrawerNavSection = {
  sectionKey: string;
  items: DrawerNavItem[];
};
