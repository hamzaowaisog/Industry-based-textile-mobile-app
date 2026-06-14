import React from 'react';

import { ProductListComponent } from '@components/products/ProductListComponent';
import { useProductList } from '@hooks/useProductList';

export const ProductListScreen = () => {
  const props = useProductList();
  return <ProductListComponent {...props} />;
};
