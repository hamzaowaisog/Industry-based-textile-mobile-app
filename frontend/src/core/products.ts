import { productGetAllProducts } from '@api/generated/product/product';

import { parseApiResponse } from '@utils/helpers/apiResponse';

import type { ProductPickerItem } from '../types/products.types';

export const fetchProductsAsync = async (): Promise<ProductPickerItem[]> => {
  try {
    const res = await productGetAllProducts();
    const r = parseApiResponse<any[]>(res as unknown, '');
    if (!r.success || !r.data) return [];
    return r.data.map((p: any) => ({
      id: p.id ?? 0,
      name: p.name ?? '',
      sku: p.sku ?? '',
      defaultPrice: p.defaultPrice ?? p.averagePrice ?? 0,
      quantity: p.quantity ?? 0,
    }));
  } catch {
    return [];
  }
};
