import React from 'react';

import Svg, { Circle, Rect } from 'react-native-svg';

interface LogoIconProps {
  size?: number;
  color?: string;
}

export const LogoIcon = ({ size = 56, color = '#fff' }: LogoIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="10" y="8" width="8" height="48" rx="4" fill={color} />
    <Rect x="46" y="8" width="8" height="48" rx="4" fill={color} />
    <Rect x="6" y="26" width="52" height="12" rx="6" fill={color} fillOpacity={0.32} />
    <Circle cx="32" cy="32" r="6" fill={color} />
  </Svg>
);
