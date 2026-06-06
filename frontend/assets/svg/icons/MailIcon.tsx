import Svg, { Path, Rect } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const MailIcon = ({ size = 18, color = '#9CA3AF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M2 7l10 7 10-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
