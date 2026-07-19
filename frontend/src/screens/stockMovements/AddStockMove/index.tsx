import React from 'react';

import { AddStockMoveComponent } from '@components/stockMovements/AddStockMoveComponent';

import { useAddStockMove } from '@hooks/useAddStockMove';

const AddStockMoveScreen = () => {
  const handlers = useAddStockMove();

  return <AddStockMoveComponent {...handlers} />;
};

export default AddStockMoveScreen;
