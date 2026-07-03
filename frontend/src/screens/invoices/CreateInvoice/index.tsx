import React from 'react';

import { CreateInvoiceComponent } from '@components/invoices/CreateInvoiceComponent';

import { useCreateInvoice } from '@hooks/useCreateInvoice';

const CreateInvoiceScreen = () => {
  const handlers = useCreateInvoice();
  return <CreateInvoiceComponent {...handlers} />;
};

export default CreateInvoiceScreen;
