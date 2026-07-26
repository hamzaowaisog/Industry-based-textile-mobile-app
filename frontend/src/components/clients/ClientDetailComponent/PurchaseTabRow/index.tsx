import React from 'react';

import { Text } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ClientPurchaseSummary } from '@api/models';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { getStatusStyle } from '@utils/helpers/clientDetailContent';
import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { TruckIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const PurchaseTabRow = ({ item }: { item: ClientPurchaseSummary }) => {
  const { t } = useTranslation();
  const s = getStatusStyle(item.statusName);
  return (
    <AppCard padding={14}>
      <AppRow
        leading={<AppIconTile Icon={TruckIcon} color={colors.warning} size={36} />}
        primary={
          item.billNo ? t('purchases.billNoLabel', { billNo: item.billNo }) : `#${item.purchaseId}`
        }
        secondary={
          item.purchaseDateHijriDisplay
            ? `${item.purchaseDate} · ${item.purchaseDateHijriDisplay}`
            : item.purchaseDate
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
