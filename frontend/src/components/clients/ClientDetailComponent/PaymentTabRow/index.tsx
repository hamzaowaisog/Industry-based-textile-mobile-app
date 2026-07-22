import React from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ClientPaymentSummary } from '@api/models';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { colors } from '@theme/colors';

import { CreditCardIcon } from '@constants/svgAssets';

export const PaymentTabRow = ({ item }: { item: ClientPaymentSummary }) => {
  const { t } = useTranslation();
  const isReceived = item.directionName?.toLowerCase() === 'received';
  return (
    <View style={item.isReversed ? { opacity: 0.5 } : undefined}>
      <AppCard padding={14}>
        <AppRow
          leading={
            <AppIconTile
              Icon={CreditCardIcon}
              color={isReceived ? colors.success : colors.warning}
              size={36}
            />
          }
          primary={item.directionName ?? ''}
          secondary={`${item.paymentDate}${
            item.paymentDateHijriDisplay ? ` · ${item.paymentDateHijriDisplay}` : ''
          }${item.isReversed ? ` · ${t('clients.reversed')}` : ''}`}
          right={
            <>
              <AppAmount
                value={item.amount ?? 0}
                tone={isReceived ? 'credit' : 'debit'}
                size={14}
              />
              <AppBadge
                label={item.modeName ?? ''}
                bg={colors.bgAlt}
                fg={colors.textSecondary}
                size="sm"
              />
            </>
          }
        />
      </AppCard>
    </View>
  );
};
