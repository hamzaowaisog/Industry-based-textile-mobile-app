import { useCallback, useEffect, useMemo } from 'react';

import { Alert } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';
import { useInvoiceStore } from '@stores/invoiceStore';

import { sumInvoiceLines } from '@utils/helpers/invoiceContent';
import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { editInvoiceValidationSchema } from '@utils/validation/invoiceValidation';

import { AppConstants } from '@constants/appConstants';

import type { InvoiceStackParamList } from '../types/navigation.types';
import type { EditInvoiceFormValues, InvoiceLineFormValues } from '../types/invoices.types';

const EMPTY_LINE: InvoiceLineFormValues = { productName: '', qty: '', unitPrice: '' };

const INITIAL_VALUES: EditInvoiceFormValues = {
  invoiceStatusId: AppConstants.INVOICE_STATUS.DRAFT,
  dueDate: '',
  notes: '',
  lines: [{ ...EMPTY_LINE }],
};

export const useEditInvoice = (invoiceId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<InvoiceStackParamList>>();
  const {
    currentInvoice,
    detailLoading,
    fetchInvoiceDetail,
    updateInvoice,
    prepareDetailLoad,
  } = useInvoiceStore();
  const getList = useMetaStore((s) => s.getList);

  const statusItems = getList(AppConstants.META.INVOICE_STATUSES).map((s) => ({
    id: s.id ?? 1,
    name: s.name ?? '',
  }));

  const formik = useFormik<EditInvoiceFormValues>({
    initialValues: INITIAL_VALUES,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await updateInvoice(invoiceId, values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('invoices.edit.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('invoices.edit.successTitle'), i18n.t('invoices.edit.successSubtitle'));
      navigation.goBack();
    },
  });

  useFocusEffect(
    useCallback(() => {
      prepareDetailLoad();
      void fetchInvoiceDetail(invoiceId);
    }, [invoiceId, prepareDetailLoad, fetchInvoiceDetail]),
  );

  useEffect(() => {
    if (currentInvoice && currentInvoice.id === invoiceId) {
      const lines: InvoiceLineFormValues[] =
        currentInvoice.lines.length > 0
          ? currentInvoice.lines.map((l) => ({
              productName: l.productName ?? '',
              qty: String(l.qty ?? ''),
              unitPrice: String(l.unitPrice ?? ''),
            }))
          : [{ ...EMPTY_LINE }];

      formik.resetForm({
        values: {
          invoiceStatusId: currentInvoice.invoiceStatusId,
          dueDate: currentInvoice.dueDate ?? '',
          notes: currentInvoice.notes ?? '',
          lines,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInvoice, invoiceId]);

  const totalAmount = useMemo(() => sumInvoiceLines(formik.values.lines), [formik.values.lines]);

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      i18n.t('invoices.edit.discardTitle'),
      i18n.t('invoices.edit.discardMessage'),
      [
        { text: i18n.t('invoices.edit.keepEditing'), style: 'cancel' },
        {
          text: i18n.t('invoices.edit.discard'),
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [navigation, formik.dirty]);

  const onFieldChange = useCallback(
    (field: keyof EditInvoiceFormValues, value: unknown) => {
      void formik.setFieldValue(field, value);
    },
    [formik],
  );

  const onAddLine = useCallback(() => {
    void formik.setFieldValue('lines', [...formik.values.lines, { ...EMPTY_LINE }]);
  }, [formik]);

  const onRemoveLine = useCallback(
    (index: number) => {
      const next = formik.values.lines.filter((_, i) => i !== index);
      void formik.setFieldValue('lines', next.length > 0 ? next : [{ ...EMPTY_LINE }]);
    },
    [formik],
  );

  const onLineChange = useCallback(
    (index: number, field: keyof InvoiceLineFormValues, value: string) => {
      const lines = [...formik.values.lines];
      lines[index] = { ...lines[index], [field]: value };
      void formik.setFieldValue('lines', lines);
    },
    [formik],
  );

  const onSubmit = useCallback(async () => {
    try {
      await editInvoiceValidationSchema.validate(formik.values, { abortEarly: false });
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

  return {
    submitting: formik.isSubmitting,
    loading: detailLoading,
    invoice: currentInvoice?.id === invoiceId ? currentInvoice : null,
    values: formik.values,
    errors: formik.errors as Partial<Record<keyof EditInvoiceFormValues, string>>,
    touched: formik.touched as Partial<Record<keyof EditInvoiceFormValues, boolean>>,
    statusItems,
    totalAmount,
    onBack,
    onSubmit,
    onFieldChange,
    onFieldBlur: formik.handleBlur,
    onAddLine,
    onRemoveLine,
    onLineChange,
  };
};
