import React from 'react';

import { RouteProp, useRoute } from '@react-navigation/native';

import { ProductDetailComponent } from '@components/products/ProductDetailComponent';

import { useAuthStore } from '@stores/authStore';

import { useProductDetail } from '@hooks/useProductDetail';

import { AppConstants } from '@constants/appConstants';

import type { ProductStackParamList } from '../../../types/navigation.types';

export const ProductDetailScreen = () => {
  const route = useRoute<RouteProp<ProductStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;
  const props = useProductDetail(productId);
  const roleId = useAuthStore((s) => s.roleId);
  const isAdmin = roleId === AppConstants.ROLES.ADMIN;
  return <ProductDetailComponent {...props} isAdmin={isAdmin} />;
};
