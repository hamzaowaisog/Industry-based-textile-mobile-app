import { LockIcon, TrendIcon, WifiIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';

import { WelcomeFeature, WelcomeStat } from '../../types/welcome.types';

export const WELCOME_STATS: WelcomeStat[] = [
  { value: '120+', labelKey: 'welcome.stats.mills' },
  { value: '4.8★', labelKey: 'welcome.stats.appRating' },
  { value: '99.9%', labelKey: 'welcome.stats.uptime' },
];

export const WELCOME_FEATURES: WelcomeFeature[] = [
  { Icon: WifiIcon, color: colors.primary, labelKey: 'welcome.features.syncLabel', subKey: 'welcome.features.syncSub' },
  { Icon: LockIcon, color: colors.success, labelKey: 'welcome.features.securityLabel', subKey: 'welcome.features.securitySub' },
  { Icon: TrendIcon, color: colors.violet, labelKey: 'welcome.features.insightsLabel', subKey: 'welcome.features.insightsSub' },
];
