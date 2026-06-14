import { useCallback, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { buildChartData, computeTrendPct } from '@utils/helpers/productMappers';
import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import {
  deleteProductAsync,
  fetchProductDetailAsync,
  fetchProductMovementsAsync,
} from '../core/products';
import type { ProductStackParamList } from '../types/navigation.types';

export const useProductDetail = (productId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<ProductStackParamList>>();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const {
    data: product,
    isFetching: productFetching,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductDetailAsync(productId),
    enabled: !!productId,
    staleTime: 0,
  });

  const {
    data: movements = [],
    isFetching: movementsFetching,
    refetch: refetchMovements,
  } = useQuery({
    queryKey: ['product-movements', productId],
    queryFn: () => fetchProductMovementsAsync(productId),
    enabled: !!productId,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void Promise.all([refetchProduct(), refetchMovements()]);
    }, [refetchProduct, refetchMovements]),
  );

  const chartData = useMemo(
    () => (product ? buildChartData(movements, product.stock) : []),
    [movements, product],
  );

  const trendPct = useMemo(() => computeTrendPct(chartData), [chartData]);

  const recentMovements = useMemo(
    () =>
      [...movements]
        .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
        .slice(0, 4),
    [movements],
  );

  const loading = productFetching || movementsFetching;

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onEdit = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.PRODUCT_FORM, { productId });
  }, [navigation, productId]);

  const onViewAllMovements = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.STOCK_MOVE_LIST as any);
  }, [navigation]);

  const onDelete = useCallback(() => {
    if (!product) return;
    Alert.alert(
      i18n.t('products.deleteTitle'),
      i18n.t('products.deleteMessage', { name: product.name }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            const result = await deleteProductAsync(productId);
            setSubmitting(false);
            if (result.success) {
              void queryClient.invalidateQueries({ queryKey: ['products'] });
              showSuccess(i18n.t('products.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [product, productId, navigation, queryClient]);

  return {
    product: loading ? null : (product ?? null),
    movements: recentMovements,
    chartData,
    trendPct,
    loading,
    submitting,
    onBack,
    onEdit,
    onDelete,
    onViewAllMovements,
    refetch: refetchProduct,
  };
};
