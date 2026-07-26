import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppHijriDateLabel } from '@components/common/AppHijriDateLabel';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { getPurchaseStatusConfig } from '@utils/helpers/purchaseContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { PurchaseCardProps } from '../../../../types/purchases.types';
import { styles } from './styles';

export const PurchaseCard = React.memo(({ purchase, onPress }: PurchaseCardProps) => {
  const { t } = useTranslation();
  const statusConfig = getPurchaseStatusConfig(purchase.statusId);
  const paidRatio = purchase.total > 0 ? Math.min(purchase.amountPaid / purchase.total, 1) : 0;
  const isCancelled = purchase.statusId === AppConstants.PURCHASE_STATUS.CANCELLED;

  return (
    <AppCard onPress={() => onPress(purchase.id)}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.purchaseId}>{`PUR-${purchase.id}`}</Text>
          <Text style={styles.supplierName}>{purchase.supplierName}</Text>
          {!!purchase.billNo && (
            <Text style={styles.date}>
              {t('purchases.billNoLabel', { billNo: purchase.billNo })}
            </Text>
          )}
          <Text style={styles.date}>{purchase.purchaseDate}</Text>
          <AppHijriDateLabel value={purchase.purchaseDateHijriDisplay} />
        </View>
        <View style={styles.right}>
          <AppAmount value={purchase.total} size={17} tone="debit" />
          <AppBadge label={purchase.statusName} bg={statusConfig.bg} fg={statusConfig.fg} />
        </View>
      </View>

      {!isCancelled && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${paidRatio * 100}%` as any,
                  backgroundColor: paidRatio >= 1 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {t('purchases.paid', { amount: formatPKR(purchase.amountPaid) })}
            </Text>
            <Text style={styles.progressLabel}>{`${Math.round(paidRatio * 100)}%`}</Text>
          </View>
        </View>
      )}
    </AppCard>
  );
});
