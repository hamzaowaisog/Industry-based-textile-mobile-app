import { useCallback, useEffect } from 'react';

import { Alert } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { useExpenseStore } from '@stores/expenseStore';
import { useMetaStore } from '@stores/metaStore';

import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { editExpenseValidationSchema } from '@utils/validation/expenseValidation';

import { AppConstants } from '@constants/appConstants';

import type { EditExpenseFormValues } from '../types/expenses.types';
import type { EditExpenseScreenProps, ExpenseStackParamList } from '../types/navigation.types';

const INITIAL_VALUES: EditExpenseFormValues = {
  amount: '',
  transModeId: AppConstants.TRANS_MODE.CASH,
  expenseDate: '',
  notes: '',
};

export const useEditExpense = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ExpenseStackParamList>>();
  const route = useRoute<EditExpenseScreenProps['route']>();
  const { expenseId } = route.params;

  const { currentExpense, detailLoading, updateExpense, fetchExpenseDetail, prepareDetailLoad } =
    useExpenseStore();
  const getList = useMetaStore((s) => s.getList);

  const transModes = getList(AppConstants.META.TRANS_MODES).map((m) => ({
    id: m.id ?? 1,
    name: m.name ?? '',
  }));

  const formik = useFormik<EditExpenseFormValues>({
    initialValues: INITIAL_VALUES,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await updateExpense(expenseId, values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('expenses.edit.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('expenses.edit.successTitle'), i18n.t('expenses.edit.successSubtitle'));
      navigation.goBack();
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    prepareDetailLoad();
    void fetchExpenseDetail(expenseId);
  }, [expenseId, fetchExpenseDetail, prepareDetailLoad]);

  useEffect(() => {
    if (!currentExpense) return;
    resetForm({
      values: {
        amount: String(currentExpense.amount),
        transModeId: currentExpense.transModeId,
        expenseDate: currentExpense.expenseDate,
        notes: currentExpense.notes ?? '',
      },
    });
  }, [currentExpense, resetForm]);

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(i18n.t('expenses.edit.discardTitle'), i18n.t('expenses.edit.discardMessage'), [
      { text: i18n.t('expenses.edit.keepEditing'), style: 'cancel' },
      {
        text: i18n.t('expenses.edit.discard'),
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation, formik.dirty]);

  const onSubmit = useCallback(async () => {
    try {
      await editExpenseValidationSchema.validate(formik.values, { abortEarly: false });
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
    expense: currentExpense,
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    transModes,
    onBack,
    onSubmit,
    onFieldChange: (field: keyof EditExpenseFormValues, value: unknown) =>
      void formik.setFieldValue(field, value),
    onFieldBlur: formik.handleBlur,
  };
};
