import React from 'react';

import { EditStockMoveComponent } from '@components/stockMovements/EditStockMoveComponent';

import { useEditStockMove } from '@hooks/useEditStockMove';

const EditStockMoveScreen = () => {
  const handlers = useEditStockMove();

  return <EditStockMoveComponent {...handlers} />;
};

export default EditStockMoveScreen;
