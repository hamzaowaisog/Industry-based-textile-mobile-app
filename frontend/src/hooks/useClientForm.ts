import { useCallback, useMemo } from 'react';

import { Alert } from 'react-native';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { useClientStore } from '@stores/clientStore';
import { useMetaStore } from '@stores/metaStore';

import { showError, showSuccess } from '@utils/toast';
import { clientValidationSchema } from '@utils/validation/clientValidation';

import { AppConstants } from '@constants/appConstants';

import type { ClientFormValues } from '../types/clients.types';
import type { ClientStackParamList } from '../types/navigation.types';

const DEFAULT_VALUES: ClientFormValues = {
  name: '',
  clientTypeId: 1,
  phone: '',
  address: '',
  creditLimit: '',
  openingBalance: '',
  notes: '',
};

export const useClientForm = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const route = useRoute<RouteProp<ClientStackParamList, 'ClientForm'>>();
  const clientId = route.params?.clientId;
  const isEdit = !!clientId;

  const { currentClient, submitting, createClient, updateClient } = useClientStore();
  const clientTypes = useMetaStore((s) => s.getList)(AppConstants.META.CLIENT_TYPES).map((ct) => ({
    id: ct.id ?? 0,
    name: ct.name ?? '',
  }));

  const initialValues: ClientFormValues = useMemo(() => {
    if (isEdit && currentClient) {
      return {
        name: currentClient.clientName,
        clientTypeId: currentClient.clientTypeId,
        phone: currentClient.phone ?? '',
        address: currentClient.address ?? '',
        creditLimit: currentClient.creditLimit != null ? String(currentClient.creditLimit) : '',
        openingBalance:
          currentClient.openingBalance != null ? String(currentClient.openingBalance) : '',
        notes: '',
      };
    }
    return DEFAULT_VALUES;
  }, [isEdit, currentClient]);

  const onSubmit = useCallback(
    async (values: ClientFormValues) => {
      try {
        let result: { success: boolean; error?: string };

        if (isEdit && clientId) {
          result = await updateClient(clientId, values);
        } else {
          result = await createClient(values);
        }

        if (result.success) {
          showSuccess(t('clients.saveSuccessTitle'), t('clients.saveSuccessSubtitle'));
          navigation.goBack();
        } else {
          showError(t('clients.saveErrorTitle'), result.error ?? t('common.errorGeneric'));
        }
      } catch (err: any) {
        console.error('Client form submission error:', err);
        showError(t('clients.saveErrorTitle'), err?.message ?? t('common.errorGeneric'));
      }
    },
    [isEdit, clientId, currentClient, createClient, updateClient, navigation, t],
  );

  const formik = useFormik<ClientFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: clientValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  const onCancel = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(t('clients.discardTitle'), t('clients.discardMessage'), [
      { text: t('clients.keepEditing'), style: 'cancel' },
      { text: t('clients.discard'), style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }, [navigation, formik.dirty, t]);

  return {
    isEdit,
    submitting,
    clientTypes,
    onCancel,
    values: formik.values,
    errors: formik.errors as Record<string, string | undefined>,
    touched: formik.touched as Record<string, boolean | undefined>,
    setFieldValue: formik.setFieldValue,
    setFieldTouched: formik.setFieldTouched,
    handleSubmit: formik.handleSubmit,
  };
};
