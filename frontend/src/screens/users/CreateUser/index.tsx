import React from 'react';

import { CreateUserComponent } from '@components/users/CreateUserComponent';

import { useCreateUser } from '@hooks/useCreateUser';

const CreateUserScreen = () => {
  const handlers = useCreateUser();
  return <CreateUserComponent {...handlers} />;
};

export default CreateUserScreen;
