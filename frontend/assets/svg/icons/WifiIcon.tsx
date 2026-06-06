import Svg, { Circle, Path } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const WifiIcon = ({ size = 18, color = '#1A56DB' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="20" r="1.5" fill={color} />
  </Svg>
);
