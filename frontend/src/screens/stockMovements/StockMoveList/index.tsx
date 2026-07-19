import React from 'react';

import { StockMoveListComponent } from '@components/stockMovements/StockMoveListComponent';

import { useStockMoveList } from '@hooks/useStockMoveList';

const StockMoveListScreen = () => {
  const handlers = useStockMoveList();

  return <StockMoveListComponent {...handlers} />;
};

export default StockMoveListScreen;
