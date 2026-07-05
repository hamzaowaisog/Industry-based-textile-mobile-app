import { useCallback, useEffect } from 'react';

import { Alert } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';
import { usePaymentStore } from '@stores/paymentStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { editPaymentValidationSchema } from '@utils/validation/paymentValidation';

import { AppConstants } from '@constants/appConstants';

import type { PaymentStackParamList } from '../types/navigation.types';
import type { EditPaymentFormValues } from '../types/payments.types';

export const useEditPayment = (paymentId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<PaymentStackParamList>>();
  const {
    currentPayment,
    detailLoading,
    fetchPaymentDetail,
    updatePayment,
    prepareDetailLoad,
  } = usePaymentStore();
  const getList = useMetaStore((s) => s.getList);

  const transModes = getList(AppConstants.META.TRANS_MODES).map((m) => ({
    id: m.id ?? 1,
    name: m.name ?? '',
  }));

  const formik = useFormik<EditPaymentFormValues>({
    initialValues: {
      transModeId: AppConstants.TRANS_MODE.BANK,
      paymentDate: '',
      notes: '',
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await updatePayment(paymentId, values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('payments.edit.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('payments.edit.successTitle'), i18n.t('payments.edit.successSubtitle'));
      navigation.goBack();
    },
  });

  useFocusEffect(
    useCallback(() => {
      prepareDetailLoad();
      void fetchPaymentDetail(paymentId);
    }, [paymentId, prepareDetailLoad, fetchPaymentDetail]),
  );

  useEffect(() => {
    if (currentPayment && currentPayment.id === paymentId) {
      formik.resetForm({
        values: {
          transModeId: currentPayment.transModeId,
          paymentDate: currentPayment.paymentDate,
          notes: currentPayment.notes ?? '',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPayment, paymentId]);

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      i18n.t('payments.edit.discardTitle'),
      i18n.t('payments.edit.discardMessage'),
      [
        { text: i18n.t('payments.edit.keepEditing'), style: 'cancel' },
        { text: i18n.t('payments.edit.discard'), style: 'destructive', onPress: () => navigation.goBack() },
      ],
    );
  }, [navigation, formik.dirty]);

  const onSubmit = useCallback(async () => {
    try {
      await editPaymentValidationSchema.validate(formik.values, { abortEarly: false });
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
    payment: currentPayment?.id === paymentId ? currentPayment : null,
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    transModes,
    onBack,
    onSubmit,
    onFieldChange: (field: keyof EditPaymentFormValues, value: unknown) =>
      void formik.setFieldValue(field, value),
    onFieldBlur: formik.handleBlur,
  };
};
