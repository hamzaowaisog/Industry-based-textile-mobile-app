import React from 'react';

import { RouteProp, useRoute } from '@react-navigation/native';

import { ProductDetailComponent } from '@components/products/ProductDetailComponent';

import { useProductDetail } from '@hooks/useProductDetail';

import type { ProductStackParamList } from '../../../types/navigation.types';

export const ProductDetailScreen = () => {
  const route = useRoute<RouteProp<ProductStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;
  const props = useProductDetail(productId);
  return <ProductDetailComponent {...props} />;
};
