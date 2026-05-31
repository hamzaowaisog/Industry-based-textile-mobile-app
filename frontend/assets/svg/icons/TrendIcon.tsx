import React from 'react';

import Svg, { Path } from 'react-native-svg';

interface TrendIconProps {
  size?: number;
  color?: string;
}

export const TrendIcon = ({ size = 18, color = '#7C3AED' }: TrendIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 6H23V12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
