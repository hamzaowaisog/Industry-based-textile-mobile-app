import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMetaStore } from '@stores/metaStore';
import { useOrderStore } from '@stores/orderStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import { updateOrderHeaderAsync, updateOrderLinesAsync } from '../core/orders';
import { fetchProductsAsync } from '../core/products';
import type { OrderStackParamList } from '../types/navigation.types';
import type { EditOrderFormValues, OrderLineFormValues } from '../types/orders.types';
import type { ProductPickerItem } from '../types/products.types';

const EMPTY_LINE: OrderLineFormValues = {
  productId: 0,
  productName: '',
  sku: '',
  qty: '',
  unitPrice: '',
};

export const useEditOrder = (orderId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const { currentOrder, detailLoading, fetchOrderDetail } = useOrderStore();
  const getList = useMetaStore((s) => s.getList);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EditOrderFormValues>({
    paymentTypeId: 1,
    notes: '',
    lines: [],
  });
  const initialValues = useRef<EditOrderFormValues | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EditOrderFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EditOrderFormValues, boolean>>>({});
  const [lineErrors, setLineErrors] = useState<{ qty?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill when order loads
  useEffect(() => {
    if (!currentOrder || currentOrder.id !== orderId) {
      void fetchOrderDetail(orderId);
      return;
    }
    const filled: EditOrderFormValues = {
      paymentTypeId: currentOrder.paymentTypeId,
      notes: currentOrder.notes ?? '',
      lines: currentOrder.orderLines.map((l) => ({
        productId: l.productId ?? 0,
        productName: l.productName ?? '',
        sku: '',
        qty: String(l.qty ?? ''),
        unitPrice: String(l.unitPrice ?? ''),
      })),
    };
    setValues(filled);
    initialValues.current = filled;
  }, [currentOrder?.id, orderId]);

  // Products
  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const productPickerIndex = useRef<number>(-1);
  const [currentPickerLineIndex, setCurrentPickerLineIndex] = useState(-1);

  useEffect(() => {
    fetchProductsAsync()
      .then(setProducts)
      .catch(() => {});
  }, []);

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

  const paymentTypes = getList(AppConstants.META.PAYMENT_TYPES).map((p) => ({
    id: p.id ?? 1,
    name: p.name ?? '',
  }));

  const runningTotal = values.lines.reduce(
    (sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
    0,
  );

  // Validation
  const validateStep2 = (): boolean => {
    if (values.lines.length === 0) {
      showError(i18n.t('orders.edit.errorTitle'), i18n.t('orders.edit.noLinesError'));
      return false;
    }
    const hasInvalid = values.lines.some(
      (l) => !l.productId || !parseFloat(l.qty) || !parseFloat(l.unitPrice),
    );
    if (hasInvalid) {
      showError(i18n.t('orders.edit.errorTitle'), i18n.t('orders.edit.incompleteLines'));
      return false;
    }
    const hasQtyError = lineErrors.some((e) => e?.qty);
    if (hasQtyError) {
      showError(i18n.t('orders.edit.errorTitle'), i18n.t('orders.edit.qtyErrorExists'));
      return false;
    }
    return true;
  };

  const hasUnsavedChanges = useMemo(() => {
    const init = initialValues.current;
    if (!init) return false;
    if (values.paymentTypeId !== init.paymentTypeId) return true;
    if (values.notes.trim() !== init.notes.trim()) return true;
    if (values.lines.length !== init.lines.length) return true;
    return values.lines.some(
      (l, i) =>
        l.productId !== init.lines[i].productId ||
        l.qty !== init.lines[i].qty ||
        l.unitPrice !== init.lines[i].unitPrice,
    );
  }, [values]);

  const onNext = useCallback(() => {
    if (step === 1 && !validateStep2()) return;
    setStep((s) => s + 1);
  }, [step, values, lineErrors]);

  const onBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }
    Alert.alert(i18n.t('orders.edit.discardTitle'), i18n.t('orders.edit.discardMessage'), [
      { text: i18n.t('orders.edit.keepEditing'), style: 'cancel' },
      {
        text: i18n.t('orders.edit.discard'),
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [step, hasUnsavedChanges, navigation]);

  const onSubmit = useCallback(async () => {
    if (!currentOrder) return;
    setSubmitting(true);
    try {
      const [headerResult, linesResult] = await Promise.all([
        updateOrderHeaderAsync(orderId, currentOrder.statusId, values.paymentTypeId, values.notes),
        updateOrderLinesAsync(orderId, values),
      ]);
      if (!headerResult.success) {
        showError(
          i18n.t('orders.edit.errorTitle'),
          headerResult.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      if (!linesResult.success) {
        showError(
          i18n.t('orders.edit.errorTitle'),
          linesResult.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('orders.edit.successTitle'), i18n.t('orders.edit.successSubtitle'));
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  }, [currentOrder, orderId, values, navigation]);

  const onFieldChange = useCallback((field: keyof EditOrderFormValues, value: any) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const onFieldBlur = useCallback((field: keyof EditOrderFormValues) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const onAddLine = useCallback(() => {
    setValues((v) => ({ ...v, lines: [...v.lines, { ...EMPTY_LINE }] }));
  }, []);

  const onRemoveLine = useCallback((index: number) => {
    setValues((v) => ({ ...v, lines: v.lines.filter((_, i) => i !== index) }));
    setLineErrors((prev) => prev.filter((_, i) => i !== index));
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
        const available = prod?.quantity ?? Infinity;
        const error =
          entered > 0 && prod && entered > available
            ? i18n.t('orders.edit.qtyExceedsStock', { available })
            : undefined;
        setLineErrors((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], qty: error };
          return next;
        });
      }
    },
    [products],
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
    submitting,
    loading: detailLoading,
    clientName: currentOrder?.clientName ?? '',
    orderId,
    runningTotal,
    paymentTypes,
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
    onSelectProduct,
    onProductPicked,
    onProductPickerClose: () => setProductPickerVisible(false),
  };
};
