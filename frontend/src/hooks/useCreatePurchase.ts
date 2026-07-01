import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';
import { useQuery } from '@tanstack/react-query';

import { useMetaStore } from '@stores/metaStore';
import { usePurchaseStore } from '@stores/purchaseStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import {
  createPurchaseStep1Schema,
  createPurchaseStep2Schema,
} from '@utils/validation/purchaseValidation';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientsAsync } from '../core/clients';
import { fetchProductsAsync } from '../core/products';
import type { PurchaseStackParamList } from '../types/navigation.types';
import type { ProductPickerItem } from '../types/products.types';
import type { CreatePurchaseFormValues, PurchaseLineFormValues } from '../types/purchases.types';

const EMPTY_LINE: PurchaseLineFormValues = {
  productId: 0,
  productName: '',
  sku: '',
  qty: '',
  unitCost: '',
};

const INITIAL_VALUES: CreatePurchaseFormValues = {
  supplierId: null,
  supplierName: '',
  paymentTypeId: AppConstants.PAYMENT_TYPE.CASH,
  notes: '',
  lines: [],
};

export const useCreatePurchase = (initialSupplierId?: number, initialSupplierName?: string) => {
  const navigation = useNavigation<NativeStackNavigationProp<PurchaseStackParamList>>();
  const { createPurchase } = usePurchaseStore();
  const getList = useMetaStore((s) => s.getList);

  const [step, setStep] = useState<number>(AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER);
  const [supplierPickerVisible, setSupplierPickerVisible] = useState(false);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const productPickerIndex = useRef<number>(-1);
  const [currentPickerLineIndex, setCurrentPickerLineIndex] = useState(-1);
  const [products, setProducts] = useState<ProductPickerItem[]>([]);

  const isSupplierLocked = !!initialSupplierId;

  const { data: clients } = useQuery({
    queryKey: queryKeys.clients.options(),
    queryFn: fetchClientsAsync,
  });

  const supplierItems = useMemo(
    () =>
      (Array.isArray(clients) ? clients : [])
        .filter((c) => c.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER)
        .map((c) => ({ id: c.id ?? 0, name: c.name ?? '' })),
    [clients],
  );

  useEffect(() => {
    fetchProductsAsync()
      .then(setProducts)
      .catch(() => {});
  }, []);

  const paymentTypes = getList(AppConstants.META.PAYMENT_TYPES).map((p) => ({
    id: p.id ?? 1,
    name: p.name ?? '',
  }));

  const resetPurchasesStack = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: AppConstants.SCREENS.MAIN.PURCHASE_LIST }],
      }),
    );
  }, [navigation]);

  const formik = useFormik<CreatePurchaseFormValues>({
    initialValues: {
      ...INITIAL_VALUES,
      supplierId: initialSupplierId ?? null,
      supplierName: initialSupplierName ?? '',
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const result = await createPurchase(values);
      if (result.success) {
        showSuccess(
          i18n.t('purchases.create.successTitle'),
          i18n.t('purchases.create.successSubtitle'),
        );
        if (initialSupplierId) {
          navigation
            .getParent<NativeStackNavigationProp<any>>()
            ?.navigate(AppConstants.SCREENS.MAIN.CLIENTS_STACK, {
              screen: AppConstants.SCREENS.MAIN.CLIENT_DETAIL,
              params: { clientId: initialSupplierId },
            });
          resetPurchasesStack();
        } else {
          navigation.goBack();
        }
      } else {
        showError(
          i18n.t('purchases.create.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
      }
    },
  });

  const productItems = useMemo(() => {
    const usedIds = new Set(
      formik.values.lines
        .filter((_, i) => i !== currentPickerLineIndex)
        .map((l) => l.productId)
        .filter((id) => id > 0),
    );
    return products
      .filter((p) => !usedIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, subtitle: p.sku }));
  }, [products, formik.values.lines, currentPickerLineIndex]);

  const runningTotal = formik.values.lines.reduce(
    (sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitCost) || 0),
    0,
  );

  const hasUnsavedChanges =
    formik.values.supplierId !== null ||
    formik.values.notes.trim() !== '' ||
    formik.values.lines.length > 0;

  const onNext = useCallback(async () => {
    if (step === AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER) {
      try {
        await createPurchaseStep1Schema.validate(formik.values, { abortEarly: false });
        setStep((s) => s + 1);
      } catch {
        void formik.setFieldTouched('supplierId', true, true);
        void formik.setFieldError(
          'supplierId',
          i18n.t('purchases.create.selectSupplierError'),
        );
      }
      return;
    }
    if (step === AppConstants.PURCHASE_WIZARD.STEP_PRODUCTS) {
      try {
        await createPurchaseStep2Schema.validate(formik.values, { abortEarly: false });
        const hasInvalid = formik.values.lines.some(
          (l) => !l.productId || !parseFloat(l.qty) || !parseFloat(l.unitCost),
        );
        if (hasInvalid) {
          showError(
            i18n.t('purchases.create.errorTitle'),
            i18n.t('purchases.create.incompleteLines'),
          );
          return;
        }
        setStep((s) => s + 1);
      } catch {
        showError(
          i18n.t('purchases.create.errorTitle'),
          i18n.t('purchases.create.noLinesError'),
        );
      }
    }
  }, [step, formik.values, formik.setFieldTouched, formik.setFieldError]);

  const onBack = useCallback(() => {
    if (step > AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER) {
      setStep((s) => s - 1);
      return;
    }
    const goBack = () => {
      if (initialSupplierId) {
        navigation
          .getParent<NativeStackNavigationProp<any>>()
          ?.navigate(AppConstants.SCREENS.MAIN.CLIENTS_STACK, {
            screen: AppConstants.SCREENS.MAIN.CLIENT_DETAIL,
            params: { clientId: initialSupplierId },
          });
        resetPurchasesStack();
      } else {
        navigation.goBack();
      }
    };
    if (!hasUnsavedChanges) {
      goBack();
      return;
    }
    Alert.alert(
      i18n.t('purchases.create.discardTitle'),
      i18n.t('purchases.create.discardMessage'),
      [
        { text: i18n.t('purchases.create.keepEditing'), style: 'cancel' },
        { text: i18n.t('purchases.create.discard'), style: 'destructive', onPress: goBack },
      ],
    );
  }, [step, hasUnsavedChanges, navigation, initialSupplierId, resetPurchasesStack]);

  const onFieldChange = useCallback(
    (field: keyof CreatePurchaseFormValues, value: any) => {
      void formik.setFieldValue(field, value);
    },
    [formik.setFieldValue],
  );

  const onFieldBlur = useCallback(
    (field: keyof CreatePurchaseFormValues) => {
      void formik.setFieldTouched(field, true, true);
    },
    [formik.setFieldTouched],
  );

  const onAddLine = useCallback(() => {
    void formik.setFieldValue('lines', [...formik.values.lines, { ...EMPTY_LINE }]);
  }, [formik.setFieldValue, formik.values.lines]);

  const onRemoveLine = useCallback(
    (index: number) => {
      void formik.setFieldValue(
        'lines',
        formik.values.lines.filter((_, i) => i !== index),
      );
    },
    [formik.setFieldValue, formik.values.lines],
  );

  const onLineChange = useCallback(
    (index: number, field: keyof PurchaseLineFormValues, value: string) => {
      const lines = [...formik.values.lines];
      lines[index] = { ...lines[index], [field]: value };
      void formik.setFieldValue('lines', lines);
    },
    [formik.setFieldValue, formik.values.lines],
  );

  const onSelectSupplier = useCallback(() => setSupplierPickerVisible(true), []);

  const onSupplierPicked = useCallback(
    (id: number, name: string) => {
      void formik.setFieldValue('supplierId', id);
      void formik.setFieldValue('supplierName', name);
      void formik.setFieldError('supplierId', undefined);
      setSupplierPickerVisible(false);
    },
    [formik.setFieldValue, formik.setFieldError],
  );

  const onSelectProduct = useCallback((index: number) => {
    productPickerIndex.current = index;
    setCurrentPickerLineIndex(index);
    setProductPickerVisible(true);
  }, []);

  const onProductPicked = useCallback(
    (id: number, name: string) => {
      const idx = productPickerIndex.current;
      const product = products.find((p) => p.id === id);
      const lines = [...formik.values.lines];
      lines[idx] = {
        ...lines[idx],
        productId: id,
        productName: name,
        sku: product?.sku ?? '',
        unitCost: product?.defaultCost ? String(product.defaultCost) : lines[idx].unitCost,
      };
      void formik.setFieldValue('lines', lines);
      setProductPickerVisible(false);
    },
    [products, formik.setFieldValue, formik.values.lines],
  );

  return {
    step,
    isSupplierLocked,
    values: formik.values,
    errors: formik.errors as Partial<Record<keyof CreatePurchaseFormValues, string>>,
    touched: formik.touched as Partial<Record<keyof CreatePurchaseFormValues, boolean>>,
    lineErrors: [] as { qty?: string }[],
    submitting: formik.isSubmitting,
    runningTotal,
    paymentTypes,
    supplierItems,
    supplierPickerVisible,
    productItems,
    productPickerVisible,
    onNext,
    onBack,
    onSubmit: formik.handleSubmit,
    onFieldChange,
    onFieldBlur,
    onAddLine,
    onRemoveLine,
    onLineChange,
    onSelectSupplier,
    onSupplierPicked,
    onSupplierPickerClose: () => setSupplierPickerVisible(false),
    onSelectProduct,
    onProductPicked,
    onProductPickerClose: () => setProductPickerVisible(false),
  };
};
