import React from 'react';

import { UserListComponent } from '@components/users/UserListComponent';

import { useUserList } from '@hooks/useUserList';

const UserListScreen = () => {
  const handlers = useUserList();
  return <UserListComponent {...handlers} />;
};

export default UserListScreen;
