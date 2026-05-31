import React from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

interface EyeIconProps {
  size?: number;
  color?: string;
}

export const EyeIcon = ({ size = 18, color = '#9CA3AF' }: EyeIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
  </Svg>
);
