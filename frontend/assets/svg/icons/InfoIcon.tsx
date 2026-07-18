import Svg, { Circle, Line } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const InfoIcon = ({ size = 20, color = '#111827' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <Line x1="12" y1="11" x2="12" y2="16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1" fill={color} />
  </Svg>
);
