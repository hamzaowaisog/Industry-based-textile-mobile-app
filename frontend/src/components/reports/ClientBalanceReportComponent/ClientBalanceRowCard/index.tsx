import React from 'react';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppAvatar } from '@components/common/AppAvatar';
import { AppCard } from '@components/common/AppCard';
import { AppRow } from '@components/common/AppRow';

import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import type { ClientBalanceRowCardProps } from '../../../../types/reports.types';

const CLIENT_TYPE_CUSTOMER = 'Customer';

export const ClientBalanceRowCard = ({ row, onPress }: ClientBalanceRowCardProps) => {
  const { t } = useTranslation();
  const isCustomer = row.clientTypeName === CLIENT_TYPE_CUSTOMER;
  const tone = isCustomer ? 'credit' : 'debit';
  const color = isCustomer ? colors.success : colors.warning;

  return (
    <AppCard padding={14} onPress={() => onPress(row.clientId)}>
      <AppRow
        leading={<AppAvatar label={getInitials(row.name)} color={color} />}
        primary={row.name}
        secondary={row.clientTypeName}
        right={<AppAmount value={row.balance} tone={tone} />}
        rightSub={
          isCustomer ? t('reports.clientBalance.owedToYou') : t('reports.clientBalance.youOwe')
        }
        chevron={false}
      />
    </AppCard>
  );
};
