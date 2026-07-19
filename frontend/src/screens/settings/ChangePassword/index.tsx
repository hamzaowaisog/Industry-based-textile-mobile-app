import React from 'react';

import { ChangePasswordComponent } from '@components/settings/ChangePasswordComponent';

import { useChangePassword } from '@hooks/useChangePassword';

const ChangePasswordScreen = () => {
  const handlers = useChangePassword();
  return <ChangePasswordComponent {...handlers} />;
};

export default ChangePasswordScreen;
