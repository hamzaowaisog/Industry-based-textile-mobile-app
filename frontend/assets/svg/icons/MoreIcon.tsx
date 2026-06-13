import React from 'react';
import Svg, { Circle } from 'react-native-svg';

type Props = { size?: number; color?: string };

export const MoreIcon = ({ size = 24, color = '#111827' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Circle cx="5" cy="12" r="1.5" fill={color} />
    <Circle cx="19" cy="12" r="1.5" fill={color} />
  </Svg>
);
