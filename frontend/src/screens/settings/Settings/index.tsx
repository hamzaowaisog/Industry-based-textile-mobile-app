import React from 'react';

import { SettingsComponent } from '@components/settings/SettingsComponent';

import { useSettings } from '@hooks/useSettings';

const SettingsScreen = () => {
  const handlers = useSettings();
  return <SettingsComponent {...handlers} />;
};

export default SettingsScreen;
