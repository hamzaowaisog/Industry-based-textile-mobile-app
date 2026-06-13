import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getOrderStatusConfig } from '@utils/helpers/orderContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { AlertIcon, CheckIcon, ClockIcon, TruckIcon } from '@constants/svgAssets';

import type { OrderStatusBannerProps } from '../../../../types/orders.types';
import { styles } from './styles';

const STATUS_ICONS: Record<number, React.ReactNode> = {
  [AppConstants.ORDER_STATUS.PENDING]: <ClockIcon size={22} color={colors.warning} />,
  [AppConstants.ORDER_STATUS.IN_PROGRESS]: <TruckIcon size={22} color={colors.primary} />,
  [AppConstants.ORDER_STATUS.DELIVERED]: <CheckIcon size={22} color={colors.success} />,
  [AppConstants.ORDER_STATUS.CANCELLED]: <AlertIcon size={22} color={colors.danger} />,
};

export const OrderStatusBanner = ({ statusId, statusName }: OrderStatusBannerProps) => {
  const { t } = useTranslation();
  const config = getOrderStatusConfig(statusId);
  const icon = STATUS_ICONS[statusId];
  const subtitleKey = `orders.statusBanner.${statusId}` as const;

  return (
    <View style={[styles.banner, { backgroundColor: config.bg }]}>
      <View style={[styles.iconTile, { backgroundColor: config.fg + '22' }]}>{icon}</View>
      <View style={styles.text}>
        <Text style={[styles.status, { color: config.fg }]}>{statusName}</Text>
        <Text style={styles.sub}>{t(subtitleKey as any)}</Text>
      </View>
    </View>
  );
};
