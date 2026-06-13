import Svg, { Circle, Polyline } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const ClockIcon = ({ size = 20, color = '#111827' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Polyline points="12 7 12 12 15 15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
