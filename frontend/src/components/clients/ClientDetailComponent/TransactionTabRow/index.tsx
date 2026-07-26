import React from 'react';

import { useTranslation } from 'react-i18next';

import type { ClientTransactionSummary } from '@api/models';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { BillNoInlineList } from '@components/common/BillNoInlineList';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { TagIcon } from '@constants/svgAssets';

export const TransactionTabRow = ({ item }: { item: ClientTransactionSummary }) => {
  const { t } = useTranslation();
  const isCredit = item.typeName?.toLowerCase() === 'credit';
  const billNos = item.billNos ?? [];
  return (
    <AppCard padding={14}>
      <AppRow
        leading={
          <AppIconTile Icon={TagIcon} color={isCredit ? colors.success : colors.danger} size={36} />
        }
        primary={item.categoryName ?? ''}
        secondary={
          billNos.length === 1
            ? `${t('transactions.billNoLabel', { billNo: billNos[0] })} · ${item.transDate}`
            : item.transDateHijriDisplay
              ? `${item.transDate} · ${item.transDateHijriDisplay}`
              : item.transDate
        }
        right={
          <>
            <AppAmount
              value={item.amount ?? 0}
              tone={isCredit ? 'credit' : 'debit'}
              size={14}
              prefix={`${isCredit ? '+' : '-'}${AppConstants.APP.CURRENCY} `}
            />
            {item.isReversal && (
              <AppBadge
                label={t('clients.reversed')}
                bg={colors.bgAlt}
                fg={colors.textSecondary}
                size="sm"
              />
            )}
          </>
        }
      />
      {billNos.length > 1 && <BillNoInlineList billNos={billNos} />}
    </AppCard>
  );
};
