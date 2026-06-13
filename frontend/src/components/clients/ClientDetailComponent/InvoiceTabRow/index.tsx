import React from 'react';

import { Text, View } from 'react-native';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { FileTextIcon } from '@constants/svgAssets';

import type { ClientInvoiceSummary } from '../../../../types/clients.types';
import { styles } from './styles';

const INVOICE_STATUS_STYLES: Record<number, { bg: string; fg: string }> = {
  1: { bg: `${colors.warning}20`, fg: colors.warning },
  2: { bg: `${colors.primary}20`, fg: colors.primary },
  3: { bg: `${colors.success}20`, fg: colors.success },
  4: { bg: `${colors.textTertiary}20`, fg: colors.textTertiary },
};

export const InvoiceTabRow = ({ item }: { item: ClientInvoiceSummary }) => {
  const s = INVOICE_STATUS_STYLES[item.invoiceStatusId] ?? {
    bg: `${colors.textTertiary}20`,
    fg: colors.textTertiary,
  };

  return (
    <View style={styles.tabRow}>
      <View style={[styles.tabRowIcon, { backgroundColor: `${colors.warning}18` }]}>
        <FileTextIcon size={18} color={colors.warning} />
      </View>
      <View style={styles.tabRowInfo}>
        <Text style={styles.tabRowPrimary}>
          {item.invoiceNumber ?? `#${item.invoiceId ?? '—'}`}
        </Text>
        <Text style={styles.tabRowSub}>{item.issueDate ?? '—'}</Text>
      </View>
      <View style={styles.tabRowRight}>
        <Text style={styles.tabRowAmount}>{formatPKR(item.totalAmount)}</Text>
        <View style={[styles.tabBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.tabBadgeText, { color: s.fg }]}>{item.statusName}</Text>
        </View>
      </View>
    </View>
  );
};
