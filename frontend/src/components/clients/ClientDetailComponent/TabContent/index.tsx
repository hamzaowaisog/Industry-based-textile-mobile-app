import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ClientTabContentProps } from '../../../../types/clients.types';
import { InvoiceTabRow } from '../InvoiceTabRow';
import { OrderTabRow } from '../OrderTabRow';
import { PaymentTabRow } from '../PaymentTabRow';
import { PurchaseTabRow } from '../PurchaseTabRow';
import { TransactionTabRow } from '../TransactionTabRow';
import { styles } from './styles';

export const TabContent = ({ tab, client }: ClientTabContentProps) => {
  const { t } = useTranslation();

  let rows: React.ReactNode[] = [];

  switch (tab) {
    case 'orders':
      rows = (client.orders ?? []).map((o) => <OrderTabRow key={o.orderId} item={o} />);
      break;
    case 'purchases':
      rows = (client.purchases ?? []).map((p) => <PurchaseTabRow key={p.purchaseId} item={p} />);
      break;
    case 'payments':
      rows = (client.payments ?? []).map((p) => <PaymentTabRow key={p.paymentId} item={p} />);
      break;
    case 'invoices':
      rows = (client.invoices ?? []).map((inv) => <InvoiceTabRow key={inv.invoiceId} item={inv} />);
      break;
    case 'transactions':
      rows = (client.recentTransactions ?? []).map((tx) => (
        <TransactionTabRow key={tx.transactionId} item={tx} />
      ));
      break;
  }

  if (rows.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('common.noData')}</Text>
      </View>
    );
  }

  return <>{rows}</>;
};
