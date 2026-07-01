import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';
import { useOrderStore } from '@stores/orderStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { editOrderStep2Schema } from '@utils/validation/orderValidation';

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

  const [step, setStep] = useState<number>(AppConstants.ORDER_WIZARD.STEP_CLIENT);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const productPickerIndex = useRef<number>(-1);
  const [currentPickerLineIndex, setCurrentPickerLineIndex] = useState(-1);
  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const [lineErrors, setLineErrors] = useState<{ qty?: string }[]>([]);
  const [lineAvailability, setLineAvailability] = useState<(string | undefined)[]>([]);
  const initialValuesRef = useRef<EditOrderFormValues | null>(null);

  useEffect(() => {
    fetchProductsAsync()
      .then(setProducts)
      .catch(() => {});
  }, []);

  const paymentTypes = getList(AppConstants.META.PAYMENT_TYPES).map((p) => ({
    id: p.id ?? 1,
    name: p.name ?? '',
  }));

  const formik = useFormik<EditOrderFormValues>({
    initialValues: {
      paymentTypeId: AppConstants.PAYMENT_TYPE.CASH,
      notes: '',
      lines: [],
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      if (!currentOrder) return;
      const [headerResult, linesResult] = await Promise.all([
        updateOrderHeaderAsync(orderId, currentOrder.statusId, values.paymentTypeId, values.notes),
        updateOrderLinesAsync(orderId, values),
      ]);
      if (!headerResult.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('orders.edit.errorTitle'),
          headerResult.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      if (!linesResult.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('orders.edit.errorTitle'),
          linesResult.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('orders.edit.successTitle'), i18n.t('orders.edit.successSubtitle'));
      navigation.goBack();
    },
  });

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
    initialValuesRef.current = filled;
    formik.resetForm({ values: filled });
  }, [currentOrder?.id, orderId]);

  const getOriginalCommittedQty = useCallback((index: number, productId: number): number => {
    const original = initialValuesRef.current?.lines[index];
    if (!original || original.productId !== productId) return 0;
    return parseFloat(original.qty) || 0;
  }, []);

  useEffect(() => {
    if (!currentOrder || currentOrder.id !== orderId || products.length === 0) return;
    setLineAvailability(
      formik.values.lines.map((line, index) => {
        const prod = products.find((p) => p.id === line.productId);
        if (!prod) return undefined;
        const entered = parseFloat(line.qty) || 0;
        const originalQty = getOriginalCommittedQty(index, line.productId);
        return i18n.t('orders.edit.availableQty', {
          count: prod.availableQuantity + originalQty - entered,
        });
      }),
    );
  }, [currentOrder?.id, orderId, products, formik.values.lines.length, getOriginalCommittedQty]);

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

  const hasUnsavedChanges = useMemo(() => {
    const init = initialValuesRef.current;
    if (!init) return false;
    if (formik.values.paymentTypeId !== init.paymentTypeId) return true;
    if (formik.values.notes.trim() !== init.notes.trim()) return true;
    if (formik.values.lines.length !== init.lines.length) return true;
    return formik.values.lines.some(
      (l, i) =>
        l.productId !== init.lines[i].productId ||
        l.qty !== init.lines[i].qty ||
        l.unitPrice !== init.lines[i].unitPrice,
    );
  }, [formik.values]);

  const onNext = useCallback(async () => {
    if (step === AppConstants.ORDER_WIZARD.STEP_PRODUCTS) {
      try {
        await editOrderStep2Schema.validate(formik.values, { abortEarly: false });
        const hasInvalid = formik.values.lines.some(
          (l) => !l.productId || !parseFloat(l.qty) || !parseFloat(l.unitPrice),
        );
        if (hasInvalid) {
          showError(i18n.t('orders.edit.errorTitle'), i18n.t('orders.edit.incompleteLines'));
          return;
        }
        const hasQtyError = lineErrors.some((e) => e?.qty);
        if (hasQtyError) {
          showError(i18n.t('orders.edit.errorTitle'), i18n.t('orders.edit.qtyErrorExists'));
          return;
        }
        setStep((s) => s + 1);
      } catch {
        showError(i18n.t('orders.edit.errorTitle'), i18n.t('orders.edit.noLinesError'));
      }
      return;
    }
    setStep((s) => s + 1);
  }, [step, formik.values, lineErrors]);

  const onBack = useCallback(() => {
    if (step > AppConstants.ORDER_WIZARD.STEP_CLIENT) {
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

  const onFieldChange = useCallback(
    (field: keyof EditOrderFormValues, value: any) => {
      void formik.setFieldValue(field, value);
    },
    [formik.setFieldValue],
  );

  const onFieldBlur = useCallback(
    (field: keyof EditOrderFormValues) => {
      void formik.setFieldTouched(field, true, false);
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
        const originalQty = productId ? getOriginalCommittedQty(index, productId) : 0;
        const available = prod ? prod.availableQuantity + originalQty : Infinity;
        const error =
          entered > 0 && prod && entered > available
            ? i18n.t('orders.edit.qtyExceedsStock', { available })
            : undefined;
        setLineErrors((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], qty: error };
          return next;
        });
        setLineAvailability((prev) => {
          const next = [...prev];
          next[index] = prod
            ? i18n.t('orders.edit.availableQty', { count: available - entered })
            : undefined;
          return next;
        });
      }
    },
    [products, getOriginalCommittedQty, formik.setFieldValue, formik.values.lines],
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
        const originalQty = product ? getOriginalCommittedQty(idx, product.id) : 0;
        next[idx] = product
          ? i18n.t('orders.edit.availableQty', { count: product.availableQuantity + originalQty })
          : undefined;
        return next;
      });
      setProductPickerVisible(false);
    },
    [products, getOriginalCommittedQty, formik.setFieldValue, formik.values.lines],
  );

  return {
    step,
    values: formik.values,
    errors: formik.errors as Partial<Record<keyof EditOrderFormValues, string>>,
    touched: formik.touched as Partial<Record<keyof EditOrderFormValues, boolean>>,
    lineErrors,
    lineAvailability,
    submitting: formik.isSubmitting,
    loading: detailLoading,
    clientName: currentOrder?.clientName ?? '',
    orderId,
    runningTotal,
    paymentTypes,
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
    onSelectProduct,
    onProductPicked,
    onProductPickerClose: () => setProductPickerVisible(false),
  };
};
