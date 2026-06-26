import {
  productCreateProduct,
  productDeleteProductById,
  productGetAllProducts,
  productGetAllProductsPaginated,
  productGetProductById,
  productUpdateProductById,
} from '@api/generated/product/product';
import { stockMovementsGetByProductId } from '@api/generated/stock-movements/stock-movements';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import {
  mapApiMovementToRow,
  mapApiProductToDetail,
  mapApiProductToRow,
} from '@utils/helpers/productMappers';

import type {
  ProductDetailData,
  ProductFormValues,
  ProductMovementRow,
  ProductPickerItem,
  ProductRow,
} from '../types/products.types';

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
      availableQuantity: p.availableQuantity ?? p.quantity ?? 0,
    }));
  } catch {
    return [];
  }
};

export const fetchProductsPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: ProductRow[]; hasNextPage: boolean }> => {
  try {
    const res = await productGetAllProductsPaginated({ page, pageSize });
    const r = parseApiResponse<any>(res as unknown, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiProductToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchProductDetailAsync = async (id: number): Promise<ProductDetailData | null> => {
  try {
    const res = await productGetProductById(id);
    const r = parseApiResponse<any>(res as unknown, '');
    if (!r.success || !r.data) return null;
    return mapApiProductToDetail(r.data);
  } catch {
    return null;
  }
};

export const fetchProductMovementsAsync = async (
  productId: number,
): Promise<ProductMovementRow[]> => {
  try {
    const res = await stockMovementsGetByProductId(productId);
    const r = parseApiResponse<any[]>(res as unknown, '');
    if (!r.success || !r.data) return [];
    return r.data.map(mapApiMovementToRow);
  } catch {
    return [];
  }
};

export const createProductAsync = async (
  values: ProductFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await productCreateProduct({
      name: values.name.trim(),
      sku: values.sku.trim(),
      unit: values.unit.trim(),
      defaultCost: parseFloat(values.defaultCost) || 0,
      defaultPrice: parseFloat(values.defaultPrice) || 0,
      quantity: parseFloat(values.quantity) || 0,
      reorderLevel: parseFloat(values.reorderLevel) || 0,
    });
    const r = parseApiResponse<any>(res as unknown, '');
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: parseApiError(err, '') };
  }
};

export const updateProductAsync = async (
  id: number,
  values: ProductFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await productUpdateProductById(id, {
      name: values.name.trim(),
      sku: values.sku.trim(),
      unit: values.unit.trim(),
      defaultCost: parseFloat(values.defaultCost) || 0,
      defaultPrice: parseFloat(values.defaultPrice) || 0,
      reorderLevel: parseFloat(values.reorderLevel) || 0,
    });
    const r = parseApiResponse<any>(res as unknown, '');
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: parseApiError(err, '') };
  }
};

export const deleteProductAsync = async (
  id: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await productDeleteProductById(id);
    const r = parseApiResponse<any>(res as unknown, '');
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: parseApiError(err, '') };
  }
};
