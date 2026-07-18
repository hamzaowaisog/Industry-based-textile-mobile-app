import React from 'react';

import { UserDetailComponent } from '@components/users/UserDetailComponent';

import { useUserDetail } from '@hooks/useUserDetail';

const UserDetailScreen = () => {
  const handlers = useUserDetail();
  return <UserDetailComponent {...handlers} />;
};

export default UserDetailScreen;
