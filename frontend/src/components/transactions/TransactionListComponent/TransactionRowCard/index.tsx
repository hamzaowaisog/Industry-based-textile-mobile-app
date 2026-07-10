import React from 'react';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import {
  TRANS_CATEGORY_ICONS,
  getTransTypeColor,
  getTransTypeSign,
} from '@utils/helpers/transactionsContent';

import { WalletIcon } from '@constants/svgAssets';

import type { TransactionRowCardProps } from '../../../../types/transactions.types';

export const TransactionRowCard = React.memo(
  ({ transaction, onPress }: TransactionRowCardProps) => {
    const color = getTransTypeColor(transaction.transTypeId);
    const sign = getTransTypeSign(transaction.transTypeId);
    const Icon = TRANS_CATEGORY_ICONS[transaction.transCategoryId] ?? WalletIcon;

    return (
      <AppCard onPress={() => onPress(transaction.id)} padding={14}>
        <AppRow
          leading={<AppIconTile Icon={Icon} color={color} size={40} />}
          primary={transaction.clientName || transaction.transCategoryName}
          secondary={`${transaction.transCategoryName} · ${transaction.transModeName} · ${transaction.transDate}`}
          right={
            <AppAmount
              value={transaction.amount}
              tone={sign === '+' ? 'credit' : 'debit'}
              prefix={`${sign}Rs `}
            />
          }
          chevron={false}
        />
      </AppCard>
    );
  },
);
