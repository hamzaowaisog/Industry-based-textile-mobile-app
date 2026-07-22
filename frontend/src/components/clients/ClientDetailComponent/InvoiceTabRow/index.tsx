import React from 'react';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { colors } from '@theme/colors';

import { FileTextIcon } from '@constants/svgAssets';

import type { ClientInvoiceSummary } from '../../../../types/clients.types';

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
    <AppCard padding={14}>
      <AppRow
        leading={<AppIconTile Icon={FileTextIcon} color={colors.warning} size={36} />}
        primary={item.invoiceNumber ?? `#${item.invoiceId ?? '—'}`}
        secondary={
          item.issueDateHijriDisplay
            ? `${item.issueDate ?? '—'} · ${item.issueDateHijriDisplay}`
            : (item.issueDate ?? '—')
        }
        right={
          <>
            <AppAmount value={item.totalAmount} size={14} />
            <AppBadge label={item.statusName} bg={s.bg} fg={s.fg} size="sm" />
          </>
        }
      />
    </AppCard>
  );
};
