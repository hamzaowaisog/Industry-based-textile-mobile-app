import React from 'react';

import { useRoute } from '@react-navigation/native';

import { EditInvoiceComponent } from '@components/invoices/EditInvoiceComponent';

import { useEditInvoice } from '@hooks/useEditInvoice';

import type { EditInvoiceScreenProps } from '../../../types/navigation.types';

const EditInvoiceScreen = () => {
  const route = useRoute<EditInvoiceScreenProps['route']>();
  const { invoiceId } = route.params;
  const handlers = useEditInvoice(invoiceId);

  return <EditInvoiceComponent {...handlers} />;
};

export default EditInvoiceScreen;
