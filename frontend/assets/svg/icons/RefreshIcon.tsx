import React from 'react';

import Svg, { Path } from 'react-native-svg';

interface RefreshIconProps {
  size?: number;
  color?: string;
}

export const RefreshIcon = ({ size = 13, color = '#6B7280' }: RefreshIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4v5h5M20 20v-5h-5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 9a9 9 0 0 0-14.85-3.36L3 10M3.51 15a9 9 0 0 0 14.85 3.36L21 14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
