import React from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { BillNoInlineList } from '@components/common/BillNoInlineList';

import { formatAmount } from '@utils/helpers/formatCurrency';
import {
  TRANS_CATEGORY_ICONS,
  getTransTypeColor,
  getTransTypeSign,
} from '@utils/helpers/transactionsContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { WalletIcon } from '@constants/svgAssets';

import type { TransactionRowCardProps } from '../../../../types/transactions.types';
import { styles } from './styles';

export const TransactionRowCard = React.memo(
  ({ transaction, onPress }: TransactionRowCardProps) => {
    const color = getTransTypeColor(transaction.transTypeId);
    const sign = getTransTypeSign(transaction.transTypeId);
    const Icon = TRANS_CATEGORY_ICONS[transaction.transCategoryId] ?? WalletIcon;
    const { t } = useTranslation();
    const billNos = transaction.billNos;
    const showInlineList = billNos.length > 1;

    return (
      <AppCard onPress={() => onPress(transaction.id)} padding={14}>
        <AppRow
          leading={<AppIconTile Icon={Icon} color={color} size={40} />}
          primary={transaction.clientName || transaction.transCategoryName}
          secondary={
            billNos.length === 1
              ? `${t('transactions.billNoLabel', { billNo: billNos[0] })} · ${transaction.transCategoryName} · ${transaction.transModeName} · ${transaction.transDate}`
              : `${transaction.transCategoryName} · ${transaction.transModeName} · ${transaction.transDate}`
          }
          right={
            <AppAmount
              value={transaction.amount}
              tone={sign === '+' ? 'credit' : 'debit'}
              prefix={`${sign}Rs `}
            />
          }
          chevron={false}
        />
        {showInlineList && (
          <View style={styles.billNoRow}>
            <BillNoInlineList billNos={billNos} />
          </View>
        )}
        {transaction.unallocatedAmount != null && transaction.unallocatedAmount > 0 && (
          <View style={styles.billNoRow}>
            <AppBadge
              label={t('transactions.unallocatedBadge', {
                amount: `${AppConstants.APP.CURRENCY} ${formatAmount(transaction.unallocatedAmount)}`,
              })}
              bg={colors.warningLight}
              fg={colors.warning}
              size="sm"
            />
          </View>
        )}
      </AppCard>
    );
  },
);
