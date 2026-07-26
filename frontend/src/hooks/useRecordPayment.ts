import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { useMetaStore } from '@stores/metaStore';
import { usePaymentStore } from '@stores/paymentStore';

import { formatPKR } from '@utils/helpers/formatCurrency';
import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';
import { recordPaymentValidationSchema } from '@utils/validation/paymentValidation';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientsAsync } from '../core/clients';
import { fetchOrderDetailAsync } from '../core/orders';
import { fetchUnallocatedCreditAsync } from '../core/payments';
import { fetchPurchaseDetailAsync } from '../core/purchases';
import type { PaymentStackParamList } from '../types/navigation.types';
import type { RecordPaymentFormValues } from '../types/payments.types';

const INITIAL_VALUES: RecordPaymentFormValues = {
  partyClientId: null,
  partyClientName: '',
  paymentDirectionId: AppConstants.PAYMENT_DIRECTION.RECEIVED,
  transModeId: AppConstants.TRANS_MODE.BANK,
  amount: '',
  paymentDate: '',
  notes: '',
  allocations: [],
};

export const useRecordPayment = (
  initialClientId?: number,
  initialClientName?: string,
  initialOrderId?: number,
  initialPurchaseId?: number,
) => {
  const navigation = useNavigation<NativeStackNavigationProp<PaymentStackParamList>>();
  const { createPayment } = usePaymentStore();
  const getList = useMetaStore((s) => s.getList);

  const [clientPickerVisible, setClientPickerVisible] = useState(false);
  const [balanceHelper, setBalanceHelper] = useState<string | null>(null);
  const [lockedOutstanding, setLockedOutstanding] = useState<number | null>(null);

  const isClientLocked = !!(initialClientId || initialOrderId || initialPurchaseId);

  const { data: clients } = useQuery({
    queryKey: queryKeys.clients.options(),
    queryFn: fetchClientsAsync,
  });

  const transModes = getList(AppConstants.META.TRANS_MODES).map((m) => ({
    id: m.id ?? 1,
    name: m.name ?? '',
  }));

  const formik = useFormik<RecordPaymentFormValues>({
    initialValues: {
      ...INITIAL_VALUES,
      partyClientId: initialClientId ?? null,
      partyClientName: initialClientName ?? '',
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      const result = await createPayment(values);
      if (!result.success) {
        helpers.setSubmitting(false);
        showError(
          i18n.t('payments.record.errorTitle'),
          result.error ?? i18n.t('common.errorGeneric'),
        );
        return;
      }
      showSuccess(i18n.t('payments.record.successTitle'), i18n.t('payments.record.successSubtitle'));
      if (result.paymentId) {
        navigation.replace(AppConstants.SCREENS.MAIN.PAYMENT_DETAIL, {
          paymentId: result.paymentId,
        });
      } else {
        navigation.goBack();
      }
    },
  });

  const clientItems = useMemo(() => {
    const directionId = formik.values.paymentDirectionId;
    const typeFilter =
      directionId === AppConstants.PAYMENT_DIRECTION.PAID
        ? AppConstants.CLIENT_TYPE.SUPPLIER
        : AppConstants.CLIENT_TYPE.CUSTOMER;
    return (Array.isArray(clients) ? clients : [])
      .filter((c) => c.clientTypeId === typeFilter)
      .map((c) => ({
        id: c.id ?? 0,
        name: c.name ?? '',
        subtitle:
          c.outstandingBalance != null && c.outstandingBalance !== 0
            ? formatPKR(Math.abs(c.outstandingBalance))
            : undefined,
      }));
  }, [clients, formik.values.paymentDirectionId]);

  const refreshBalanceHelper = useCallback(
    async (clientId: number, directionId: number) => {
      const credit = await fetchUnallocatedCreditAsync(clientId);
      if (!credit?.unallocatedAmount) {
        setBalanceHelper(null);
        return;
      }
      const amount = formatPKR(credit.unallocatedAmount);
      setBalanceHelper(
        directionId === AppConstants.PAYMENT_DIRECTION.PAID
          ? i18n.t('payments.balancePaidHelper', { amount })
          : i18n.t('payments.balanceHelper', { amount }),
      );
    },
    [],
  );

  useEffect(() => {
    const loadPrefill = async () => {
      if (initialOrderId) {
        const order = await fetchOrderDetailAsync(initialOrderId);
        if (!order) return;
        formik.resetForm({
          values: {
            ...INITIAL_VALUES,
            partyClientId: order.clientId,
            partyClientName: order.clientName,
            paymentDirectionId: AppConstants.PAYMENT_DIRECTION.RECEIVED,
            amount: order.outstanding > 0 ? String(order.outstanding) : '',
            allocations:
              order.outstanding > 0
                ? [
                    {
                      orderId: order.id,
                      purchaseId: null,
                      allocatedAmount: String(order.outstanding),
                      label: order.billNo ? `Bill #${order.billNo}` : `ORD-${order.id}`,
                    },
                  ]
                : [],
          },
        });
        setLockedOutstanding(order.outstanding > 0 ? order.outstanding : null);
        void refreshBalanceHelper(order.clientId, AppConstants.PAYMENT_DIRECTION.RECEIVED);
        return;
      }

      if (initialPurchaseId) {
        const purchase = await fetchPurchaseDetailAsync(initialPurchaseId);
        if (!purchase) return;
        formik.resetForm({
          values: {
            ...INITIAL_VALUES,
            partyClientId: purchase.supplierId,
            partyClientName: purchase.supplierName,
            paymentDirectionId: AppConstants.PAYMENT_DIRECTION.PAID,
            amount: purchase.payable > 0 ? String(purchase.payable) : '',
            allocations:
              purchase.payable > 0
                ? [
                    {
                      orderId: null,
                      purchaseId: purchase.id,
                      allocatedAmount: String(purchase.payable),
                      label: purchase.billNo ? `Bill #${purchase.billNo}` : `PUR-${purchase.id}`,
                    },
                  ]
                : [],
          },
        });
        setLockedOutstanding(purchase.payable > 0 ? purchase.payable : null);
        void refreshBalanceHelper(purchase.supplierId, AppConstants.PAYMENT_DIRECTION.PAID);
        return;
      }

      if (initialClientId) {
        void refreshBalanceHelper(initialClientId, formik.values.paymentDirectionId);
      }
    };

    void loadPrefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialClientId, initialClientName, initialOrderId, initialPurchaseId]);

  const overpayHelper = useMemo(() => {
    if (lockedOutstanding === null) return null;
    const entered = parseFloat(formik.values.amount);
    if (Number.isNaN(entered) || entered <= lockedOutstanding) return null;
    const excess = entered - lockedOutstanding;
    const key =
      formik.values.paymentDirectionId === AppConstants.PAYMENT_DIRECTION.PAID
        ? 'payments.overpayHelperPaid'
        : 'payments.overpayHelperReceived';
    return i18n.t(key, {
      allocated: formatPKR(lockedOutstanding),
      excess: formatPKR(excess),
    });
  }, [lockedOutstanding, formik.values.amount, formik.values.paymentDirectionId]);

  const onBack = useCallback(() => {
    if (!formik.dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      i18n.t('payments.record.discardTitle'),
      i18n.t('payments.record.discardMessage'),
      [
        { text: i18n.t('payments.record.keepEditing'), style: 'cancel' },
        { text: i18n.t('payments.record.discard'), style: 'destructive', onPress: () => navigation.goBack() },
      ],
    );
  }, [navigation, formik.dirty]);

  const onFieldChange = useCallback(
    (field: keyof RecordPaymentFormValues, value: unknown) => {
      void formik.setFieldValue(field, value);
      if (field === 'paymentDirectionId') {
        void formik.setFieldValue('partyClientId', null);
        void formik.setFieldValue('partyClientName', '');
        setBalanceHelper(null);
      }
      if (field === 'partyClientId' && typeof value === 'number') {
        void refreshBalanceHelper(value, formik.values.paymentDirectionId);
      }
    },
    [formik, refreshBalanceHelper],
  );

  const onClientPicked = useCallback(
    (id: number, name: string) => {
      void formik.setFieldValue('partyClientId', id);
      void formik.setFieldValue('partyClientName', name);
      setClientPickerVisible(false);
      void refreshBalanceHelper(id, formik.values.paymentDirectionId);
    },
    [formik, refreshBalanceHelper],
  );

  const onNext = useCallback(async () => {
    try {
      await recordPaymentValidationSchema.validate(formik.values, { abortEarly: false });
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
    isClientLocked,
    balanceHelper,
    overpayHelper,
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    transModes,
    clientItems,
    clientPickerVisible,
    onBack,
    onSubmit: onNext,
    onFieldChange,
    onFieldBlur: formik.handleBlur,
    onSelectClient: () => setClientPickerVisible(true),
    onClientPicked,
    onClientPickerClose: () => setClientPickerVisible(false),
  };
};
