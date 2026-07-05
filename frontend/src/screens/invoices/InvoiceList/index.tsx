import React from 'react';

import { InvoiceListComponent } from '@components/invoices/InvoiceListComponent';

import { useInvoiceList } from '@hooks/useInvoiceList';
import { useInvoicePdfActions } from '@hooks/useInvoicePdfActions';

const InvoiceListScreen = () => {
  const props = useInvoiceList();
  const pdfActions = useInvoicePdfActions();
  return <InvoiceListComponent {...props} {...pdfActions} />;
};

export default InvoiceListScreen;
