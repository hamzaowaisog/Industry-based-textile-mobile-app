import React, { useCallback } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/native';

import { InvoiceDetailComponent } from '@components/invoices/InvoiceDetailComponent';

import { useInvoiceDetail } from '@hooks/useInvoiceDetail';

import type { InvoiceDetailScreenProps } from '../../../types/navigation.types';

const InvoiceDetailScreen = () => {
  const route = useRoute<InvoiceDetailScreenProps['route']>();
  const { invoiceId } = route.params;
  const handlers = useInvoiceDetail(invoiceId);

  useFocusEffect(
    useCallback(() => {
      handlers.load();
    }, [invoiceId]),
  );

  return <InvoiceDetailComponent {...handlers} />;
};

export default InvoiceDetailScreen;
