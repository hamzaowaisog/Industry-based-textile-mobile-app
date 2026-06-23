import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';

import { ORDER_STATUS_ICONS, getOrderStatusConfig } from '@utils/helpers/orderContent';

import { AppConstants } from '@constants/appConstants';

import type { AppCardTone } from '../../../../types/common.types';
import type { OrderStatusBannerProps } from '../../../../types/orders.types';
import { styles } from './styles';

const STATUS_TONE: Record<number, AppCardTone> = {
  [AppConstants.ORDER_STATUS.PENDING]: 'warningLight',
  [AppConstants.ORDER_STATUS.IN_PROGRESS]: 'primaryLight',
  [AppConstants.ORDER_STATUS.DELIVERED]: 'successLight',
  [AppConstants.ORDER_STATUS.CANCELLED]: 'dangerLight',
};

export const OrderStatusBanner = ({ statusId, statusName }: OrderStatusBannerProps) => {
  const { t } = useTranslation();
  const config = getOrderStatusConfig(statusId);
  const Icon = ORDER_STATUS_ICONS[statusId];
  const subtitleKey = `orders.statusBanner.${statusId}` as const;

  return (
    <AppCard tone={STATUS_TONE[statusId] ?? 'surface'}>
      <View style={styles.banner}>
        {Icon && <AppIconTile Icon={Icon} color={config.fg} size={40} />}
        <View style={styles.text}>
          <Text style={[styles.status, { color: config.fg }]}>{statusName}</Text>
          <Text style={styles.sub}>{t(subtitleKey as any)}</Text>
        </View>
      </View>
    </AppCard>
  );
};
