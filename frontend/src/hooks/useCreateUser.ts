import { useCallback, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { showError, showSuccess } from '@utils/toast';
import { createUserValidationSchema } from '@utils/validation/userValidation';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { createUserAsync } from '../core/users';
import type { UserStackParamList } from '../types/navigation.types';
import type { CreateUserFormValues } from '../types/users.types';

const DEFAULT_VALUES: CreateUserFormValues = {
  name: '',
  email: '',
  userName: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  roleId: AppConstants.ROLES.STAFF,
};

export const useCreateUser = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = useCallback(
    async (values: CreateUserFormValues) => {
      const result = await createUserAsync({
        name: values.name,
        email: values.email,
        userName: values.userName,
        phoneNumber: values.phoneNumber || undefined,
        password: values.password,
        confirmPassword: values.confirmPassword,
        roleId: values.roleId,
        isActive: true,
      });

      if (result.success) {
        showSuccess(t('users.createSuccessTitle'), t('users.createSuccessSubtitle'));
        void queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
        navigation.goBack();
      } else {
        showError(t('users.createErrorTitle'), result.error ?? t('common.errorGeneric'));
      }
    },
    [navigation, queryClient, t],
  );

  const formik = useFormik<CreateUserFormValues>({
    initialValues: DEFAULT_VALUES,
    validationSchema: createUserValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  const onTogglePassword = useCallback(() => setShowPassword((v) => !v), []);
  const onToggleConfirmPassword = useCallback(() => setShowConfirmPassword((v) => !v), []);

  const onCancel = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(t('users.discardTitle'), t('users.discardMessage'), [
      { text: t('users.keepEditing'), style: 'cancel' },
      { text: t('users.discard'), style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }, [navigation, formik.dirty, t]);

  return {
    values: formik.values,
    errors: formik.errors as Record<string, string | undefined>,
    touched: formik.touched as Record<string, boolean | undefined>,
    submitting: formik.isSubmitting,
    showPassword,
    showConfirmPassword,
    onTogglePassword,
    onToggleConfirmPassword,
    setFieldValue: formik.setFieldValue,
    setFieldTouched: formik.setFieldTouched,
    handleSubmit: formik.handleSubmit,
    onCancel,
  };
};
