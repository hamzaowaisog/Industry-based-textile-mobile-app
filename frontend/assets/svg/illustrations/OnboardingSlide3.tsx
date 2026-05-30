import React from 'react';

import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

export const OnboardingSlide3 = () => (
  <Svg width={220} height={200} viewBox="0 0 220 200" fill="none">
    {/* Main chart card */}
    <Rect x="24" y="36" width="172" height="120" rx="14" fill="#fff" stroke={colors.violet} strokeWidth="2.5" />
    <Rect x="36" y="48" width="56" height="6" rx="3" fill={colors.bgAlt} />
    <Rect x="36" y="60" width="40" height="4" rx="2" fill={colors.bgAlt} />

    {/* Trend chip */}
    <Rect x="160" y="46" width="28" height="16" rx="8" fill={colors.successLight} />
    <SvgText x="174" y="57" textAnchor="middle" fontFamily={typography.fontFamily.bold} fontSize="9" fill={colors.success}>
      +24%
    </SvgText>

    {/* Colored bars */}
    {([60, 90, 70, 110, 92, 130] as const).map((h, i) => (
      <Rect
        key={i}
        x={44 + i * 24}
        y={150 - h * 0.55}
        width="16"
        height={h * 0.55}
        rx="4"
        fill={[colors.primary, colors.success, colors.warning, colors.violet, colors.danger, '#06B6D4'][i]}
      />
    ))}

    {/* Insight card (rotated) */}
    <G rotation="-6" originX="60" originY="170">
      <Rect x="20" y="158" width="84" height="34" rx="8" fill="#fff" stroke={colors.success} strokeWidth="2" />
      <Circle cx="34" cy="174" r="8" fill={colors.successLight} />
      <Path d="M30 174 L33 177 L38 171" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="48" y="168" width="44" height="4" rx="2" fill={colors.text} fillOpacity={0.7} />
      <Rect x="48" y="176" width="32" height="4" rx="2" fill={colors.bgAlt} />
    </G>

    {/* Sparkle — top right */}
    <Path d="M198 28 L201 35 L208 38 L201 41 L198 48 L195 41 L188 38 L195 35 Z" fill={colors.warning} />
    {/* Sparkle — left */}
    <Path d="M14 110 L16 115 L21 117 L16 119 L14 124 L12 119 L7 117 L12 115 Z" fill={colors.violet} />
    {/* Sparkle — bottom right */}
    <Path d="M204 130 L206 134 L210 136 L206 138 L204 142 L202 138 L198 136 L202 134 Z" fill={colors.primary} />

    {/* PDF chip (rotated) */}
    <G rotation="8" originX="174" originY="172">
      <Rect x="150" y="156" width="48" height="32" rx="6" fill={colors.violet} />
      <SvgText x="174" y="177" textAnchor="middle" fontFamily={typography.fontFamily.bold} fontSize="11" fill="#fff">
        PDF
      </SvgText>
    </G>
  </Svg>
);
