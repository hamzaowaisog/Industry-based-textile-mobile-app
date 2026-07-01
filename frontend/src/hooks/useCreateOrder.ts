import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';
import { useOrderStore } from '@stores/orderStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { createOrderStep1Schema, createOrderStep2Schema } from '@utils/validation/orderValidation';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientsAsync } from '../core/clients';
import { fetchProductsAsync } from '../core/products';
import type { OrderStackParamList } from '../types/navigation.types';
import type { CreateOrderFormValues, OrderLineFormValues } from '../types/orders.types';
import type { ProductPickerItem } from '../types/products.types';

const EMPTY_LINE: OrderLineFormValues = {
  productId: 0,
  productName: '',
  sku: '',
  qty: '',
  unitPrice: '',
};

const INITIAL_VALUES: CreateOrderFormValues = {
  clientId: null,
  clientName: '',
  paymentTypeId: AppConstants.PAYMENT_TYPE.CASH,
  orderDate: '',
  notes: '',
  lines: [],
};

export const useCreateOrder = (initialClientId?: number, initialClientName?: string) => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const { createOrder } = useOrderStore();
  const getList = useMetaStore((s) => s.getList);

  const [step, setStep] = useState<number>(AppConstants.ORDER_WIZARD.STEP_CLIENT);
  const [clientPickerVisible, setClientPickerVisible] = useState(false);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const productPickerIndex = useRef<number>(-1);
  const [currentPickerLineIndex, setCurrentPickerLineIndex] = useState(-1);
  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const [lineErrors, setLineErrors] = useState<{ qty?: string }[]>([]);

  const isClientLocked = !!initialClientId;
  const [lineAvailability, setLineAvailability] = useState<(string | undefined)[]>([]);

  const { data: clients } = useQuery({
    queryKey: queryKeys.clients.options(),
    queryFn: fetchClientsAsync,
  });

  const clientItems = useMemo(
    () =>
      (Array.isArray(clients) ? clients : [])
        .filter((c) => c.clientTypeId === AppConstants.CLIENT_TYPE.CUSTOMER)
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

  const resetOrdersStack = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: AppConstants.SCREENS.MAIN.ORDER_LIST }],
      }),
    );
  }, [navigation]);

  const formik = useFormik<CreateOrderFormValues>({
    initialValues: {
      ...INITIAL_VALUES,
      clientId: initialClientId ?? null,
      clientName: initialClientName ?? '',
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const result = await createOrder(values);
      if (result.success) {
        showSuccess(i18n.t('orders.create.successTitle'), i18n.t('orders.create.successSubtitle'));
        if (initialClientId) {
          navigation
            .getParent<NativeStackNavigationProp<any>>()
            ?.navigate(AppConstants.SCREENS.MAIN.CLIENTS_STACK, {
              screen: AppConstants.SCREENS.MAIN.CLIENT_DETAIL,
              params: { clientId: initialClientId },
            });
          resetOrdersStack();
        } else {
          navigation.goBack();
        }
      } else {
        showError(
          i18n.t('orders.create.errorTitle'),
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
    (sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
    0,
  );

  const hasUnsavedChanges =
    formik.values.clientId !== null ||
    formik.values.notes.trim() !== '' ||
    formik.values.lines.length > 0;

  const onNext = useCallback(async () => {
    if (step === AppConstants.ORDER_WIZARD.STEP_CLIENT) {
      try {
        await createOrderStep1Schema.validate(formik.values, { abortEarly: false });
        setStep((s) => s + 1);
      } catch {
        void formik.setFieldTouched('clientId', true, true);
        void formik.setFieldError('clientId', i18n.t('orders.create.selectCustomerError'));
      }
      return;
    }
    if (step === AppConstants.ORDER_WIZARD.STEP_PRODUCTS) {
      try {
        await createOrderStep2Schema.validate(formik.values, { abortEarly: false });
        const hasInvalid = formik.values.lines.some(
          (l) => !l.productId || !parseFloat(l.qty) || !parseFloat(l.unitPrice),
        );
        if (hasInvalid) {
          showError(i18n.t('orders.create.errorTitle'), i18n.t('orders.create.incompleteLines'));
          return;
        }
        const hasQtyError = lineErrors.some((e) => e?.qty);
        if (hasQtyError) {
          showError(i18n.t('orders.create.errorTitle'), i18n.t('orders.create.qtyErrorExists'));
          return;
        }
        setStep((s) => s + 1);
      } catch {
        showError(i18n.t('orders.create.errorTitle'), i18n.t('orders.create.noLinesError'));
      }
    }
  }, [step, formik.values, lineErrors, formik.setFieldTouched, formik.setFieldError]);

  const onBack = useCallback(() => {
    if (step > AppConstants.ORDER_WIZARD.STEP_CLIENT) {
      setStep((s) => s - 1);
      return;
    }
    const goBackOrClient = () => {
      if (initialClientId) {
        navigation
          .getParent<NativeStackNavigationProp<any>>()
          ?.navigate(AppConstants.SCREENS.MAIN.CLIENTS_STACK, {
            screen: AppConstants.SCREENS.MAIN.CLIENT_DETAIL,
            params: { clientId: initialClientId },
          });
        resetOrdersStack();
      } else {
        navigation.goBack();
      }
    };
    if (!hasUnsavedChanges) {
      goBackOrClient();
      return;
    }
    Alert.alert(i18n.t('orders.create.discardTitle'), i18n.t('orders.create.discardMessage'), [
      { text: i18n.t('orders.create.keepEditing'), style: 'cancel' },
      { text: i18n.t('orders.create.discard'), style: 'destructive', onPress: goBackOrClient },
    ]);
  }, [step, hasUnsavedChanges, navigation, initialClientId, resetOrdersStack]);

  const onFieldChange = useCallback(
    (field: keyof CreateOrderFormValues, value: any) => {
      void formik.setFieldValue(field, value);
    },
    [formik.setFieldValue],
  );

  const onFieldBlur = useCallback(
    (field: keyof CreateOrderFormValues) => {
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
      setLineErrors((prev) => prev.filter((_, i) => i !== index));
      setLineAvailability((prev) => prev.filter((_, i) => i !== index));
    },
    [formik.setFieldValue, formik.values.lines],
  );

  const onLineChange = useCallback(
    (index: number, field: keyof OrderLineFormValues, value: string, productId?: number) => {
      const lines = [...formik.values.lines];
      lines[index] = { ...lines[index], [field]: value };
      void formik.setFieldValue('lines', lines);

      if (field === 'qty') {
        const entered = parseFloat(value) || 0;
        const prod = products.find((p) => p.id === productId);
        const available = prod?.availableQuantity ?? Infinity;
        const error =
          entered > 0 && prod && entered > available
            ? i18n.t('orders.create.qtyExceedsStock', { available })
            : undefined;
        setLineErrors((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], qty: error };
          return next;
        });
        setLineAvailability((prev) => {
          const next = [...prev];
          next[index] = prod
            ? i18n.t('orders.create.availableQty', { count: prod.availableQuantity - entered })
            : undefined;
          return next;
        });
      }
    },
    [products, formik.setFieldValue, formik.values.lines],
  );

  const onSelectClient = useCallback(() => setClientPickerVisible(true), []);

  const onClientPicked = useCallback(
    (id: number, name: string) => {
      void formik.setFieldValue('clientId', id);
      void formik.setFieldValue('clientName', name);
      void formik.setFieldError('clientId', undefined);
      setClientPickerVisible(false);
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
        unitPrice: product?.defaultPrice ? String(product.defaultPrice) : lines[idx].unitPrice,
      };
      void formik.setFieldValue('lines', lines);
      setLineErrors((prev) => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], qty: undefined };
        return next;
      });
      setLineAvailability((prev) => {
        const next = [...prev];
        next[idx] = product
          ? i18n.t('orders.create.availableQty', { count: product.availableQuantity })
          : undefined;
        return next;
      });
      setProductPickerVisible(false);
    },
    [products, formik.setFieldValue, formik.values.lines],
  );

  return {
    step,
    isClientLocked,
    values: formik.values,
    errors: formik.errors as Partial<Record<keyof CreateOrderFormValues, string>>,
    touched: formik.touched as Partial<Record<keyof CreateOrderFormValues, boolean>>,
    lineErrors,
    lineAvailability,
    submitting: formik.isSubmitting,
    runningTotal,
    paymentTypes,
    clientItems,
    clientPickerVisible,
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
    onSelectClient,
    onClientPicked,
    onClientPickerClose: () => setClientPickerVisible(false),
    onSelectProduct,
    onProductPicked,
    onProductPickerClose: () => setProductPickerVisible(false),
  };
};
