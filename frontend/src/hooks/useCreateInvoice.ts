import { useCallback, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { useInvoiceStore } from '@stores/invoiceStore';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { sumInvoiceLines } from '@utils/helpers/invoiceContent';
import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { createInvoiceValidationSchema } from '@utils/validation/invoiceValidation';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientsAsync } from '../core/clients';
import type { InvoiceStackParamList } from '../types/navigation.types';
import type { CreateInvoiceFormValues, InvoiceLineFormValues } from '../types/invoices.types';

const EMPTY_LINE: InvoiceLineFormValues = { productName: '', qty: '', unitPrice: '' };

const INITIAL_VALUES: CreateInvoiceFormValues = {
  clientId: null,
  clientName: '',
  dueDate: '',
  notes: '',
  lines: [{ ...EMPTY_LINE }],
};

export const useCreateInvoice = () => {
  const navigation = useNavigation<NativeStackNavigationProp<InvoiceStackParamList>>();
  const { createInvoice } = useInvoiceStore();
  const [clientPickerVisible, setClientPickerVisible] = useState(false);

  const { data: clients } = useQuery({
    queryKey: queryKeys.clients.options(),
    queryFn: fetchClientsAsync,
  });

  const formik = useFormik<CreateInvoiceFormValues>({
    initialValues: INITIAL_VALUES,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await createInvoice(values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('invoices.create.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(
        i18n.t('invoices.create.successTitle'),
        i18n.t('invoices.create.successSubtitle'),
      );
      if (result.invoiceId) {
        navigation.replace(AppConstants.SCREENS.MAIN.INVOICE_DETAIL, {
          invoiceId: result.invoiceId,
        });
      } else {
        navigation.goBack();
      }
    },
  });

  const clientItems = useMemo(
    () =>
      (Array.isArray(clients) ? clients : []).map((c) => ({
        id: c.id ?? 0,
        name: c.name ?? '',
        subtitle:
          c.outstandingBalance != null && c.outstandingBalance !== 0
            ? formatPKR(Math.abs(c.outstandingBalance))
            : undefined,
      })),
    [clients],
  );

  const totalAmount = useMemo(() => sumInvoiceLines(formik.values.lines), [formik.values.lines]);

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      i18n.t('invoices.create.discardTitle'),
      i18n.t('invoices.create.discardMessage'),
      [
        { text: i18n.t('invoices.create.keepEditing'), style: 'cancel' },
        {
          text: i18n.t('invoices.create.discard'),
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [navigation, formik.dirty]);

  const onFieldChange = useCallback(
    (field: keyof CreateInvoiceFormValues, value: unknown) => {
      void formik.setFieldValue(field, value);
    },
    [formik],
  );

  const onClientPicked = useCallback(
    (id: number, name: string) => {
      void formik.setFieldValue('clientId', id);
      void formik.setFieldValue('clientName', name);
      setClientPickerVisible(false);
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
      await createInvoiceValidationSchema.validate(formik.values, { abortEarly: false });
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
    values: formik.values,
    errors: formik.errors as Partial<Record<keyof CreateInvoiceFormValues, string>>,
    touched: formik.touched as Partial<Record<keyof CreateInvoiceFormValues, boolean>>,
    clientItems,
    clientPickerVisible,
    totalAmount,
    onBack,
    onSubmit,
    onFieldChange,
    onFieldBlur: formik.handleBlur,
    onSelectClient: () => setClientPickerVisible(true),
    onClientPicked,
    onClientPickerClose: () => setClientPickerVisible(false),
    onAddLine,
    onRemoveLine,
    onLineChange,
  };
};
