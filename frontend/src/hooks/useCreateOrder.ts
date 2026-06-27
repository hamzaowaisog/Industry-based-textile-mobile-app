import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useMetaStore } from '@stores/metaStore';
import { useOrderStore } from '@stores/orderStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';

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
  const { createOrder, submitting } = useOrderStore();
  const getList = useMetaStore((s) => s.getList);

  // ── Form state (declared first — other memos depend on values) ────────────
  const [step, setStep] = useState<number>(AppConstants.ORDER_WIZARD.STEP_CLIENT);
  const [values, setValues] = useState<CreateOrderFormValues>({
    ...INITIAL_VALUES,
    clientId: initialClientId ?? null,
    clientName: initialClientName ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOrderFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CreateOrderFormValues, boolean>>>({});
  const [lineErrors, setLineErrors] = useState<{ qty?: string }[]>([]);
  const [lineAvailability, setLineAvailability] = useState<(string | undefined)[]>([]);

  // ── Clients ──────────────────────────────────────────────────────────────
  const { data: clients } = useQuery({ queryKey: queryKeys.clients.options(), queryFn: fetchClientsAsync });
  const [clientPickerVisible, setClientPickerVisible] = useState(false);

  const clientItems = useMemo(
    () =>
      (Array.isArray(clients) ? clients : [])
        .filter((c) => c.clientTypeId === AppConstants.CLIENT_TYPE.CUSTOMER)
        .map((c) => ({ id: c.id ?? 0, name: c.name ?? '' })),
    [clients],
  );

  // ── Products ─────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const productPickerIndex = useRef<number>(-1);
  const [currentPickerLineIndex, setCurrentPickerLineIndex] = useState(-1);

  useEffect(() => {
    fetchProductsAsync()
      .then(setProducts)
      .catch(() => {});
  }, []);

  // products available for the current picker — excludes already-selected products in other lines
  const productItems = useMemo(() => {
    const usedIds = new Set(
      values.lines
        .filter((_, i) => i !== currentPickerLineIndex)
        .map((l) => l.productId)
        .filter((id) => id > 0),
    );
    return products
      .filter((p) => !usedIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, subtitle: p.sku }));
  }, [products, values.lines, currentPickerLineIndex]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const paymentTypes = getList(AppConstants.META.PAYMENT_TYPES).map((p) => ({
    id: p.id ?? 1,
    name: p.name ?? '',
  }));

  const runningTotal = values.lines.reduce((sum, l) => {
    return sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0);
  }, 0);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Partial<Record<keyof CreateOrderFormValues, string>> = {};
    if (!values.clientId) errs.clientId = i18n.t('orders.create.selectCustomerError');
    setErrors(errs);
    setTouched((t) => ({ ...t, clientId: true }));
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (values.lines.length === 0) {
      showError(i18n.t('orders.create.errorTitle'), i18n.t('orders.create.noLinesError'));
      return false;
    }
    const hasInvalid = values.lines.some(
      (l) => !l.productId || !parseFloat(l.qty) || !parseFloat(l.unitPrice),
    );
    if (hasInvalid) {
      showError(i18n.t('orders.create.errorTitle'), i18n.t('orders.create.incompleteLines'));
      return false;
    }
    const hasQtyError = lineErrors.some((e) => e?.qty);
    if (hasQtyError) {
      showError(i18n.t('orders.create.errorTitle'), i18n.t('orders.create.qtyErrorExists'));
      return false;
    }
    return true;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const hasUnsavedChanges =
    values.clientId !== null || values.notes.trim() !== '' || values.lines.length > 0;

  const resetOrdersStack = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: AppConstants.SCREENS.MAIN.ORDER_LIST }],
      }),
    );
  }, [navigation]);

  const onNext = useCallback(() => {
    if (step === AppConstants.ORDER_WIZARD.STEP_CLIENT && !validateStep1()) return;
    if (step === AppConstants.ORDER_WIZARD.STEP_PRODUCTS && !validateStep2()) return;
    setStep((s) => s + 1);
  }, [step, values, lineErrors]);

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

  const onSubmit = useCallback(async () => {
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
      showError(i18n.t('orders.create.errorTitle'), result.error ?? i18n.t('common.errorGeneric'));
    }
  }, [values, createOrder, navigation, initialClientId, resetOrdersStack]);

  // ── Field handlers ────────────────────────────────────────────────────────
  const onFieldChange = useCallback((field: keyof CreateOrderFormValues, value: any) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const onFieldBlur = useCallback((field: keyof CreateOrderFormValues) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const onAddLine = useCallback(() => {
    setValues((v) => ({ ...v, lines: [...v.lines, { ...EMPTY_LINE }] }));
  }, []);

  const onRemoveLine = useCallback((index: number) => {
    setValues((v) => ({ ...v, lines: v.lines.filter((_, i) => i !== index) }));
    setLineErrors((prev) => prev.filter((_, i) => i !== index));
    setLineAvailability((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onLineChange = useCallback(
    (index: number, field: keyof OrderLineFormValues, value: string, productId?: number) => {
      setValues((v) => {
        const lines = [...v.lines];
        lines[index] = { ...lines[index], [field]: value };
        return { ...v, lines };
      });

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
    [products],
  );

  // ── Client picker ─────────────────────────────────────────────────────────
  const onSelectClient = useCallback(() => setClientPickerVisible(true), []);

  const onClientPicked = useCallback((id: number, name: string) => {
    setValues((v) => ({ ...v, clientId: id, clientName: name }));
    setErrors((e) => ({ ...e, clientId: undefined }));
    setClientPickerVisible(false);
  }, []);

  // ── Product picker ────────────────────────────────────────────────────────
  const onSelectProduct = useCallback((index: number) => {
    productPickerIndex.current = index;
    setCurrentPickerLineIndex(index);
    setProductPickerVisible(true);
  }, []);

  const onProductPicked = useCallback(
    (id: number, name: string) => {
      const idx = productPickerIndex.current;
      const product = products.find((p) => p.id === id);
      setValues((v) => {
        const lines = [...v.lines];
        lines[idx] = {
          ...lines[idx],
          productId: id,
          productName: name,
          sku: product?.sku ?? '',
          unitPrice: product?.defaultPrice ? String(product.defaultPrice) : lines[idx].unitPrice,
        };
        return { ...v, lines };
      });
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
    [products],
  );

  return {
    step,
    values,
    errors,
    touched,
    lineErrors,
    lineAvailability,
    submitting,
    runningTotal,
    paymentTypes,
    clientItems,
    clientPickerVisible,
    productItems,
    productPickerVisible,
    onNext,
    onBack,
    onSubmit,
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
