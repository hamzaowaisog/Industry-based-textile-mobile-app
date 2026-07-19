import React, { useCallback } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/native';

import { StockMoveDetailComponent } from '@components/stockMovements/StockMoveDetailComponent';

import { useStockMoveDetail } from '@hooks/useStockMoveDetail';

import type { StockMoveDetailScreenProps } from '../../../types/navigation.types';

const StockMoveDetailScreen = () => {
  const route = useRoute<StockMoveDetailScreenProps['route']>();
  const { movementId } = route.params;
  const handlers = useStockMoveDetail(movementId);

  useFocusEffect(
    useCallback(() => {
      handlers.load();
    }, [movementId]),
  );

  return <StockMoveDetailComponent {...handlers} />;
};

export default StockMoveDetailScreen;
