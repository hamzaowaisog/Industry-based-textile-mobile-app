import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';

import { PRODUCT_UNIT_OPTIONS } from '@utils/helpers/productContent';
import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import {
  productCreateValidationSchema,
  productEditValidationSchema,
} from '@utils/validation/productValidation';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { createProductAsync, fetchProductDetailAsync, updateProductAsync } from '../core/products';
import type { ProductStackParamList } from '../types/navigation.types';
import type { ProductFormValues } from '../types/products.types';

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  sku: '',
  unitId: 0,
  defaultCost: '',
  defaultPrice: '',
  quantity: '0',
  reorderLevel: '0',
};

export const useProductForm = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProductStackParamList>>();
  const route = useRoute<RouteProp<ProductStackParamList, 'ProductForm'>>();
  const productId = route.params?.productId;
  const isEdit = !!productId;

  const [unitPickerVisible, setUnitPickerVisible] = useState(false);

  const metaUnits = useMetaStore((s) => s.getList)(AppConstants.META.UNITS);
  const unitItems = useMemo(() => {
    if (metaUnits.length > 0) {
      return metaUnits.map((u) => ({ id: u.id ?? 0, name: u.name ?? '' }));
    }
    return PRODUCT_UNIT_OPTIONS.map((u, i) => ({ id: i + 1, name: u }));
  }, [metaUnits]);

  const { data: existingProduct, isLoading: loading } = useQuery({
    queryKey: queryKeys.products.detail(productId!),
    queryFn: () => fetchProductDetailAsync(productId!),
    enabled: isEdit,
  });

  const initialValues: ProductFormValues = useMemo(() => {
    if (isEdit && existingProduct) {
      return {
        name: existingProduct.name,
        sku: existingProduct.sku,
        unitId: existingProduct.unitId,
        defaultCost: String(existingProduct.defaultCost),
        defaultPrice: String(existingProduct.defaultPrice),
        quantity: '0',
        reorderLevel: String(existingProduct.reorderLevel),
      };
    }
    return DEFAULT_VALUES;
  }, [isEdit, existingProduct]);

  const isDiscardingRef = useRef(false);

  const formik = useFormik<ProductFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: isEdit ? productEditValidationSchema : productCreateValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result =
        isEdit && productId
          ? await updateProductAsync(productId, values)
          : await createProductAsync(values);

      if (result.success) {
        showSuccess(
          i18n.t(isEdit ? 'products.edit.successTitle' : 'products.create.successTitle'),
          i18n.t(isEdit ? 'products.edit.successSubtitle' : 'products.create.successSubtitle'),
        );
        isDiscardingRef.current = true;
        navigation.goBack();
      } else {
        helpers.setSubmitting(false);
        showError(
          i18n.t(isEdit ? 'products.edit.errorTitle' : 'products.create.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
      }
    },
  });

  const confirmDiscard = useCallback((onConfirm: () => void) => {
    Alert.alert(i18n.t('products.edit.discardTitle'), i18n.t('products.edit.discardMessage'), [
      { text: i18n.t('products.edit.keepEditing'), style: 'cancel' },
      { text: i18n.t('products.edit.discard'), style: 'destructive', onPress: onConfirm },
    ]);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isDiscardingRef.current) return;
      e.preventDefault();
      confirmDiscard(() => {
        isDiscardingRef.current = true;
        navigation.dispatch(e.data.action);
      });
    });
    return unsubscribe;
  }, [navigation, confirmDiscard]);

  const onCancel = useCallback(() => {
    confirmDiscard(() => {
      isDiscardingRef.current = true;
      navigation.goBack();
    });
  }, [navigation, confirmDiscard]);

  return {
    isEdit,
    submitting: formik.isSubmitting,
    loading: isEdit ? loading && !existingProduct : false,
    unitPickerVisible,
    values: formik.values,
    errors: formik.errors as Record<string, string | undefined>,
    touched: formik.touched as Record<string, boolean | undefined>,
    setFieldValue: formik.setFieldValue,
    setFieldTouched: formik.setFieldTouched,
    handleSubmit: formik.handleSubmit,
    unitItems,
    onCancel,
    onOpenUnitPicker: () => setUnitPickerVisible(true),
    onCloseUnitPicker: () => setUnitPickerVisible(false),
  };
};
