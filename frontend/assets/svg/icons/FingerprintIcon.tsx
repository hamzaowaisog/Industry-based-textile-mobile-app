import React from 'react';

import Svg, { Path } from 'react-native-svg';

interface FingerprintIconProps {
  size?: number;
  color?: string;
}

export const FingerprintIcon = ({ size = 20, color = '#111827' }: FingerprintIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 5.5a10 10 0 0 1 15 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M7 8a7 7 0 0 1 10 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M9.5 10.5a4 4 0 0 1 5 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M4.5 5.5C3.5 7 3 8.9 3 11c0 2.5.7 4.8 1.9 6.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M19.5 5.5C20.5 7 21 8.9 21 11c0 2.5-.7 4.8-1.9 6.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M7 8C6.4 9 6 10.1 6 11.5c0 2 .6 3.8 1.6 5.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M17 8C17.6 9 18 10.1 18 11.5c0 2-.6 3.8-1.6 5.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M9.5 10.5C9.2 11.1 9 11.8 9 12.5c0 1.4.5 2.7 1.3 3.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M14.5 10.5C14.8 11.1 15 11.8 15 12.5c0 1.4-.5 2.7-1.3 3.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M12 11.5v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
