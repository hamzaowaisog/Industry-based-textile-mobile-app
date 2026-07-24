import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';
import { usePurchaseStore } from '@stores/purchaseStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import {
  editPurchaseStep2Schema,
} from '@utils/validation/purchaseValidation';

import { AppConstants } from '@constants/appConstants';

import { updatePurchaseHeaderAsync, updatePurchaseLinesAsync } from '../core/purchases';
import { fetchProductsAsync } from '../core/products';
import type { PurchaseStackParamList } from '../types/navigation.types';
import type { EditPurchaseFormValues, PurchaseLineFormValues } from '../types/purchases.types';
import type { ProductPickerItem } from '../types/products.types';

const EMPTY_LINE: PurchaseLineFormValues = {
  productId: 0,
  productName: '',
  sku: '',
  qty: '',
  unitCost: '',
};

export const useEditPurchase = (purchaseId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<PurchaseStackParamList>>();
  const { currentPurchase, detailLoading, fetchPurchaseDetail } = usePurchaseStore();
  const getList = useMetaStore((s) => s.getList);

  const [step, setStep] = useState<number>(AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const productPickerIndex = useRef<number>(-1);
  const [currentPickerLineIndex, setCurrentPickerLineIndex] = useState(-1);
  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const initialValuesRef = useRef<EditPurchaseFormValues | null>(null);

  useEffect(() => {
    fetchProductsAsync()
      .then(setProducts)
      .catch(() => {});
  }, []);

  const paymentTypes = getList(AppConstants.META.PAYMENT_TYPES).map((p) => ({
    id: p.id ?? 1,
    name: p.name ?? '',
  }));

  const formik = useFormik<EditPurchaseFormValues>({
    initialValues: {
      paymentTypeId: AppConstants.PAYMENT_TYPE.CASH,
      notes: '',
      billNo: '',
      lines: [],
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      if (!currentPurchase) return;
      const [headerResult, linesResult] = await Promise.all([
        updatePurchaseHeaderAsync(
          purchaseId,
          currentPurchase.statusId,
          values.paymentTypeId,
          values.notes,
          values.billNo,
        ),
        updatePurchaseLinesAsync(purchaseId, values),
      ]);
      if (!headerResult.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('purchases.edit.errorTitle'),
          headerResult.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      if (!linesResult.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('purchases.edit.errorTitle'),
          linesResult.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('purchases.edit.successTitle'), i18n.t('purchases.edit.successSubtitle'));
      navigation.goBack();
    },
  });

  // Pre-fill when purchase loads
  useEffect(() => {
    if (!currentPurchase || currentPurchase.id !== purchaseId) {
      void fetchPurchaseDetail(purchaseId);
      return;
    }
    const filled: EditPurchaseFormValues = {
      paymentTypeId: currentPurchase.paymentTypeId,
      notes: currentPurchase.notes ?? '',
      billNo: currentPurchase.billNo ?? '',
      lines: currentPurchase.purchaseLines.map((l) => ({
        productId: l.productId ?? 0,
        productName: l.productName ?? '',
        sku: '',
        qty: String(l.qty ?? ''),
        unitCost: String(l.unitCost ?? ''),
      })),
    };
    initialValuesRef.current = filled;
    formik.resetForm({ values: filled });
  }, [currentPurchase?.id, purchaseId]);

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

  const hasUnsavedChanges = useMemo(() => {
    const init = initialValuesRef.current;
    if (!init) return false;
    if (formik.values.paymentTypeId !== init.paymentTypeId) return true;
    if (formik.values.notes.trim() !== init.notes.trim()) return true;
    if (formik.values.billNo.trim() !== init.billNo.trim()) return true;
    if (formik.values.lines.length !== init.lines.length) return true;
    return formik.values.lines.some(
      (l, i) =>
        l.productId !== init.lines[i].productId ||
        l.qty !== init.lines[i].qty ||
        l.unitCost !== init.lines[i].unitCost,
    );
  }, [formik.values]);

  const onNext = useCallback(async () => {
    if (step === AppConstants.PURCHASE_WIZARD.STEP_PRODUCTS) {
      try {
        await editPurchaseStep2Schema.validate(formik.values, { abortEarly: false });
        const hasInvalid = formik.values.lines.some(
          (l) => !l.productId || !parseFloat(l.qty) || !parseFloat(l.unitCost),
        );
        if (hasInvalid) {
          showError(
            i18n.t('purchases.edit.errorTitle'),
            i18n.t('purchases.edit.incompleteLines'),
          );
          return;
        }
        setStep((s) => s + 1);
      } catch {
        showError(
          i18n.t('purchases.edit.errorTitle'),
          i18n.t('purchases.edit.noLinesError'),
        );
      }
      return;
    }
    setStep((s) => s + 1);
  }, [step, formik.values]);

  const onBack = useCallback(() => {
    if (step > AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER) {
      setStep((s) => s - 1);
      return;
    }
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }
    Alert.alert(i18n.t('purchases.edit.discardTitle'), i18n.t('purchases.edit.discardMessage'), [
      { text: i18n.t('purchases.edit.keepEditing'), style: 'cancel' },
      {
        text: i18n.t('purchases.edit.discard'),
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [step, hasUnsavedChanges, navigation]);

  const onFieldChange = useCallback(
    (field: keyof EditPurchaseFormValues, value: any) => {
      void formik.setFieldValue(field, value);
    },
    [formik.setFieldValue],
  );

  const onFieldBlur = useCallback(
    (field: keyof EditPurchaseFormValues) => {
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
      lines[idx] = { ...lines[idx], productId: id, productName: name, sku: product?.sku ?? '' };
      void formik.setFieldValue('lines', lines);
      setProductPickerVisible(false);
    },
    [products, formik.setFieldValue, formik.values.lines],
  );

  return {
    step,
    values: formik.values,
    errors: formik.errors as Partial<Record<keyof EditPurchaseFormValues, string>>,
    touched: formik.touched as Partial<Record<keyof EditPurchaseFormValues, boolean>>,
    lineErrors: [] as { qty?: string }[],
    submitting: formik.isSubmitting,
    loading: detailLoading,
    supplierName: currentPurchase?.supplierName ?? '',
    purchaseId,
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
