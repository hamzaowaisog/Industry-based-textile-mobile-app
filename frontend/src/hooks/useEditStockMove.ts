import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useStockMovementStore } from '@stores/stockMovementStore';
import { useMetaStore } from '@stores/metaStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { editStockMoveValidationSchema } from '@utils/validation/stockMovementsValidation';

import { AppConstants } from '@constants/appConstants';

import { fetchProductsAsync } from '../core/products';
import type { EditStockMoveFormValues } from '../types/stockMovements.types';
import type { EditStockMoveScreenProps, StockStackParamList } from '../types/navigation.types';
import type { ProductPickerItem } from '../types/products.types';

const INITIAL_VALUES: EditStockMoveFormValues = {
  productId: null,
  productName: '',
  movementSource: AppConstants.MOVEMENT_SOURCE.MANUAL,
  movementType: AppConstants.MOVEMENT_TYPE.IN,
  qty: '',
  unitCost: '',
  unitPrice: '',
  movementDate: '',
};

export const useEditStockMove = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StockStackParamList>>();
  const route = useRoute<EditStockMoveScreenProps['route']>();
  const { movementId } = route.params;

  const {
    currentMovement,
    detailLoading,
    updateMovement,
    fetchMovementDetail,
    prepareDetailLoad,
  } = useStockMovementStore();
  const getList = useMetaStore((s) => s.getList);

  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);

  useEffect(() => {
    fetchProductsAsync()
      .then(setProducts)
      .catch(() => {});
  }, []);

  const movementSources = getList(AppConstants.META.MOVEMENT_SOURCES).map((s) => ({
    id: s.id ?? 0,
    name: s.name ?? '',
  }));

  const movementTypes = getList(AppConstants.META.MOVEMENT_TYPES).map((t) => ({
    id: t.id ?? 0,
    name: t.name ?? '',
  }));

  const formik = useFormik<EditStockMoveFormValues>({
    initialValues: INITIAL_VALUES,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await updateMovement(movementId, values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('stockMovements.edit.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(
        i18n.t('stockMovements.edit.successTitle'),
        i18n.t('stockMovements.edit.successSubtitle'),
      );
      navigation.goBack();
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    prepareDetailLoad();
    void fetchMovementDetail(movementId);
  }, [movementId, fetchMovementDetail, prepareDetailLoad]);

  useEffect(() => {
    if (!currentMovement) return;
    resetForm({
      values: {
        productId: currentMovement.productId,
        productName: currentMovement.productName,
        movementSource: currentMovement.movementSourceId,
        movementType: currentMovement.movementTypeId,
        qty: String(currentMovement.qty),
        unitCost: currentMovement.unitCost !== null ? String(currentMovement.unitCost) : '',
        unitPrice: currentMovement.unitPrice !== null ? String(currentMovement.unitPrice) : '',
        movementDate: currentMovement.movementDate,
      },
    });
  }, [currentMovement, resetForm]);

  const productItems = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name, subtitle: p.sku })),
    [products],
  );

  const selectedProductStock = useMemo(() => {
    const product = products.find((p) => p.id === formik.values.productId);
    return product ? product.availableQuantity : null;
  }, [products, formik.values.productId]);

  const onOpenProductPicker = useCallback(() => setProductPickerVisible(true), []);
  const onProductPickerClose = useCallback(() => setProductPickerVisible(false), []);

  const onProductPicked = useCallback(
    (id: number, name: string) => {
      void formik.setFieldValue('productId', id);
      void formik.setFieldValue('productName', name);
      void formik.setFieldError('productId', undefined);
      setProductPickerVisible(false);
    },
    [formik.setFieldValue, formik.setFieldError],
  );

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      i18n.t('stockMovements.edit.discardTitle'),
      i18n.t('stockMovements.edit.discardMessage'),
      [
        { text: i18n.t('stockMovements.edit.keepEditing'), style: 'cancel' },
        {
          text: i18n.t('stockMovements.edit.discard'),
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [navigation, formik.dirty]);

  const onSubmit = useCallback(async () => {
    try {
      await editStockMoveValidationSchema.validate(formik.values, { abortEarly: false });
      void formik.handleSubmit();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'inner' in err) {
        const yupErr = err as { inner: { path?: string; message: string }[] };
        yupErr.inner.forEach((e) => {
          if (e.path) {
            void formik.setFieldTouched(e.path, true, false);
            void formik.setFieldError(e.path, i18n.t(e.message));
          }
        });
      }
    }
  }, [formik]);

  const onFieldChange = useCallback(
    (field: keyof EditStockMoveFormValues, value: unknown) => {
      void formik.setFieldValue(field, value);
      if (field === 'movementSource' && value !== AppConstants.MOVEMENT_SOURCE.MANUAL) {
        void formik.setFieldValue('movementType', null);
      }
      if (field === 'movementSource' && value === AppConstants.MOVEMENT_SOURCE.MANUAL) {
        void formik.setFieldValue('movementType', AppConstants.MOVEMENT_TYPE.IN);
      }
    },
    [formik],
  );

  return {
    submitting: formik.isSubmitting,
    loading: detailLoading,
    movement: currentMovement,
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    movementSources,
    movementTypes,
    productItems,
    selectedProductStock,
    productPickerVisible,
    onOpenProductPicker,
    onProductPicked,
    onProductPickerClose,
    onBack,
    onSubmit,
    onFieldChange,
    onFieldBlur: formik.handleBlur,
  };
};
