import { CheckIcon, LockIcon, MailIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';

import { ForgotPasswordStep } from '../../types/forgotPassword.types';

export const FORGOT_PASSWORD_STEPS: ForgotPasswordStep[] = [
  { Icon: MailIcon, bg: colors.primaryLight, color: colors.primary, labelKey: 'forgotPassword.step1' },
  { Icon: LockIcon, bg: colors.warningLight, color: colors.warning, labelKey: 'forgotPassword.step2' },
  { Icon: CheckIcon, bg: colors.successLight, color: colors.success, labelKey: 'forgotPassword.step3' },
];
