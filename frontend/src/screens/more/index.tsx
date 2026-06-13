import React from 'react';

import { MoreComponent } from '@components/more';
import { useMore } from '@hooks/useMore';

export const MoreScreen = () => {
  const { items, profile, unreadCount, onBack, onTilePress } = useMore();
  return (
    <MoreComponent
      items={items}
      profile={profile}
      unreadCount={unreadCount}
      onBack={onBack}
      onTilePress={onTilePress}
    />
  );
};
