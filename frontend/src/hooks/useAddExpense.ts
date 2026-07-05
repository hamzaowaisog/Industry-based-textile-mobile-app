import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useExpenseStore } from '@stores/expenseStore';
import { useMetaStore } from '@stores/metaStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { addExpenseValidationSchema } from '@utils/validation/expenseValidation';

import { AppConstants } from '@constants/appConstants';

import type { AddExpenseFormValues } from '../types/expenses.types';
import type { ExpenseStackParamList } from '../types/navigation.types';

const INITIAL_VALUES: AddExpenseFormValues = {
  expenseTypeId: null,
  amount: '',
  transModeId: AppConstants.TRANS_MODE.CASH,
  expenseDate: '',
  notes: '',
};

export const useAddExpense = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ExpenseStackParamList>>();
  const { createExpense } = useExpenseStore();
  const getList = useMetaStore((s) => s.getList);

  const expenseTypes = getList(AppConstants.META.EXPENSE_TYPES).map((e) => ({
    id: e.id ?? 0,
    name: e.name ?? '',
  }));

  const transModes = getList(AppConstants.META.TRANS_MODES).map((m) => ({
    id: m.id ?? 1,
    name: m.name ?? '',
  }));

  const formik = useFormik<AddExpenseFormValues>({
    initialValues: INITIAL_VALUES,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await createExpense(values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('expenses.add.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('expenses.add.successTitle'), i18n.t('expenses.add.successSubtitle'));
      navigation.goBack();
    },
  });

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(i18n.t('expenses.add.discardTitle'), i18n.t('expenses.add.discardMessage'), [
      { text: i18n.t('expenses.add.keepEditing'), style: 'cancel' },
      {
        text: i18n.t('expenses.add.discard'),
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation, formik.dirty]);

  const onSubmit = useCallback(async () => {
    try {
      await addExpenseValidationSchema.validate(formik.values, { abortEarly: false });
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
    errors: formik.errors,
    touched: formik.touched,
    expenseTypes,
    transModes,
    onBack,
    onSubmit,
    onFieldChange: (field: keyof AddExpenseFormValues, value: unknown) =>
      void formik.setFieldValue(field, value),
    onFieldBlur: formik.handleBlur,
  };
};
