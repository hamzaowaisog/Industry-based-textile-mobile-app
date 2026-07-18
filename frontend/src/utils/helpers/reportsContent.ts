import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import {
  BarChartIcon,
  CreditCardIcon,
  TrendIcon,
  UserIcon,
  UsersIcon,
} from '../../constants/svgAssets';
import type { IconProps } from '../../types/icon.types';
import type { ClientDetailTab, ReportKey } from '../../types/reports.types';

export type ReportCardConfig = {
  key: ReportKey;
  Icon: ComponentType<IconProps>;
  color: string;
  titleKey: string;
  descKey: string;
};

export const REPORT_CARDS: ReportCardConfig[] = [
  {
    key: 'profitLoss',
    Icon: BarChartIcon,
    color: colors.primary,
    titleKey: 'reports.hub.profitLoss.title',
    descKey: 'reports.hub.profitLoss.desc',
  },
  {
    key: 'clientBalance',
    Icon: UsersIcon,
    color: colors.warning,
    titleKey: 'reports.hub.clientBalance.title',
    descKey: 'reports.hub.clientBalance.desc',
  },
  {
    key: 'creditDebit',
    Icon: TrendIcon,
    color: colors.violet,
    titleKey: 'reports.hub.creditDebit.title',
    descKey: 'reports.hub.creditDebit.desc',
  },
  {
    key: 'summary',
    Icon: CreditCardIcon,
    color: colors.success,
    titleKey: 'reports.hub.summary.title',
    descKey: 'reports.hub.summary.desc',
  },
  {
    key: 'clientDetail',
    Icon: UserIcon,
    color: colors.purple,
    titleKey: 'reports.hub.clientDetail.title',
    descKey: 'reports.hub.clientDetail.desc',
  },
];

export const CLIENT_DETAIL_TABS: { id: ClientDetailTab; labelKey: string }[] = [
  { id: 'orders', labelKey: 'reports.clientDetail.tabs.orders' },
  { id: 'purchases', labelKey: 'reports.clientDetail.tabs.purchases' },
  { id: 'payments', labelKey: 'reports.clientDetail.tabs.payments' },
];
