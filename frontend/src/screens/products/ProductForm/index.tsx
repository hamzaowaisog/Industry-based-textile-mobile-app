import React from 'react';

import { ProductFormComponent } from '@components/products/ProductFormComponent';
import { useProductForm } from '@hooks/useProductForm';

export const ProductFormScreen = () => {
  const props = useProductForm();
  return <ProductFormComponent {...props} />;
};
