import React from 'react';
import { StyleSheet } from 'react-native';

import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';

export const WeavePattern = () => (
  <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
    <Defs>
      <Pattern id="wp" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
        <Path d="M0 16 L32 16 M16 0 L16 32" stroke="#fff" strokeOpacity={0.06} strokeWidth={0.6} />
        <Circle cx="16" cy="16" r="1.4" fill="#fff" fillOpacity={0.12} />
      </Pattern>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#wp)" />
  </Svg>
);
