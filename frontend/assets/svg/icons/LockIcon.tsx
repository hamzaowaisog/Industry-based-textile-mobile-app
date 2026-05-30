import React from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

interface LockIconProps {
  size?: number;
  color?: string;
}

export const LockIcon = ({ size = 18, color = '#0E9F6E' }: LockIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
