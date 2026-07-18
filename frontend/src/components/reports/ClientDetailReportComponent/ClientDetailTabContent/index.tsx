import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { getStatusStyle } from '@utils/helpers/clientDetailContent';

import { colors } from '@theme/colors';

import { CreditCardIcon, ShoppingBagIcon, TruckIcon } from '@constants/svgAssets';

import type { ClientDetailTabContentProps } from '../../../../types/reports.types';
import { styles } from './styles';

export const ClientDetailTabContent = ({ tab, detail }: ClientDetailTabContentProps) => {
  const { t } = useTranslation();

  if (tab === 'orders') {
    if (detail.orders.length === 0)
      return <Text style={styles.emptyText}>{t('reports.clientDetail.noOrders')}</Text>;
    return (
      <View style={styles.list}>
        {detail.orders.map((o) => {
          const s = getStatusStyle(o.statusName);
          return (
            <AppCard key={o.orderId} padding={14}>
              <AppRow
                leading={<AppIconTile Icon={ShoppingBagIcon} color={colors.primary} size={36} />}
                primary={t('reports.clientDetail.orderRef', { id: o.orderId })}
                secondary={o.orderDate}
                right={
                  <>
                    <AppAmount value={o.total} size={14} />
                    <AppBadge label={o.statusName} bg={s.bg} fg={s.fg} size="sm" />
                  </>
                }
                chevron={false}
              />
            </AppCard>
          );
        })}
      </View>
    );
  }

  if (tab === 'purchases') {
    if (detail.purchases.length === 0)
      return <Text style={styles.emptyText}>{t('reports.clientDetail.noPurchases')}</Text>;
    return (
      <View style={styles.list}>
        {detail.purchases.map((p) => {
          const s = getStatusStyle(p.statusName);
          return (
            <AppCard key={p.purchaseId} padding={14}>
              <AppRow
                leading={<AppIconTile Icon={TruckIcon} color={colors.warning} size={36} />}
                primary={t('reports.clientDetail.purchaseRef', { id: p.purchaseId })}
                secondary={p.purchaseDate}
                right={
                  <>
                    <AppAmount value={p.total} size={14} />
                    <AppBadge label={p.statusName} bg={s.bg} fg={s.fg} size="sm" />
                  </>
                }
                chevron={false}
              />
            </AppCard>
          );
        })}
      </View>
    );
  }

  if (detail.payments.length === 0)
    return <Text style={styles.emptyText}>{t('reports.clientDetail.noPayments')}</Text>;

  return (
    <View style={styles.list}>
      {detail.payments.map((p) => (
        <AppCard key={p.paymentId} padding={14}>
          <AppRow
            leading={<AppIconTile Icon={CreditCardIcon} color={colors.success} size={36} />}
            primary={`${p.directionName} · ${p.modeName}`}
            secondary={p.paymentDate}
            right={<AppAmount value={p.amount} tone={p.isReversed ? 'debit' : 'credit'} size={14} />}
            rightSub={p.isReversed ? t('reports.clientDetail.reversed') : undefined}
            chevron={false}
          />
        </AppCard>
      ))}
    </View>
  );
};
