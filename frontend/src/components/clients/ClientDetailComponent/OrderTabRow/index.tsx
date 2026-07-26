import React from 'react';

import { Text } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ClientOrderSummary } from '@api/models';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { getStatusStyle } from '@utils/helpers/clientDetailContent';
import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { ShoppingBagIcon as OrderIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const OrderTabRow = ({ item }: { item: ClientOrderSummary }) => {
  const { t } = useTranslation();
  const s = getStatusStyle(item.statusName);
  return (
    <AppCard padding={14}>
      <AppRow
        leading={<AppIconTile Icon={OrderIcon} color={colors.primary} size={36} />}
        primary={item.billNo ? t('orders.billNoLabel', { billNo: item.billNo }) : `#${item.orderId}`}
        secondary={
          item.orderDateHijriDisplay
            ? `${item.orderDate} · ${item.orderDateHijriDisplay}`
            : item.orderDate
        }
        right={
          <>
            <AppAmount value={item.total ?? 0} size={14} />
            {(item.amountPaid ?? 0) > 0 && (
              <Text style={styles.tabRowSub}>
                {t('orders.paid', { amount: formatPKR(item.amountPaid ?? 0) })}
              </Text>
            )}
            <AppBadge label={item.statusName ?? ''} bg={s.bg} fg={s.fg} size="sm" />
          </>
        }
      />
    </AppCard>
  );
};
