import React from 'react';

import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

export const OnboardingSlide1 = () => (
  <Svg width={220} height={200} viewBox="0 0 220 200" fill="none">
    {/* Floating card — top left */}
    <G rotation="-8" originX="80" originY="70">
      <Rect x="20" y="40" width="80" height="46" rx="10" fill="#fff" stroke={colors.primary} strokeWidth="2" />
      <Rect x="28" y="48" width="36" height="6" rx="3" fill={colors.primaryLight} />
      <Rect x="28" y="60" width="60" height="4" rx="2" fill={colors.bgAlt} />
      <Rect x="28" y="68" width="44" height="4" rx="2" fill={colors.bgAlt} />
    </G>

    {/* Floating card — bottom right */}
    <G rotation="6" originX="160" originY="130">
      <Rect x="120" y="100" width="80" height="56" rx="10" fill="#fff" stroke={colors.success} strokeWidth="2" />
      <Circle cx="138" cy="120" r="10" fill={colors.successLight} />
      <Path d="M134 120 L137 123 L143 117" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="156" y="116" width="36" height="4" rx="2" fill={colors.bgAlt} />
      <Rect x="156" y="124" width="28" height="4" rx="2" fill={colors.bgAlt} />
    </G>

    {/* Phone body */}
    <Rect x="80" y="30" width="80" height="150" rx="14" fill="#fff" stroke={colors.primary} strokeWidth="2.5" />
    <Rect x="80" y="30" width="80" height="22" rx="14" fill={colors.primary} />
    <Rect x="80" y="40" width="80" height="12" fill={colors.primary} />
    <Circle cx="120" cy="40" r="3" fill="rgba(255,255,255,0.4)" />

    {/* Phone screen content */}
    <Rect x="88" y="62" width="64" height="6" rx="3" fill={colors.text} fillOpacity={0.85} />
    <Rect x="88" y="74" width="40" height="4" rx="2" fill={colors.bgAlt} />

    {/* Stat cards */}
    <Rect x="88" y="86" width="30" height="34" rx="6" fill={colors.primaryLight} />
    <Rect x="92" y="92" width="14" height="3" rx="1.5" fill={colors.primary} />
    <Rect x="92" y="100" width="22" height="6" rx="2" fill={colors.primary} />
    <Rect x="122" y="86" width="30" height="34" rx="6" fill={colors.warningLight} />
    <Rect x="126" y="92" width="14" height="3" rx="1.5" fill={colors.warning} />
    <Rect x="126" y="100" width="22" height="6" rx="2" fill={colors.warning} />

    {/* Bar chart */}
    <Rect x="88" y="128" width="64" height="36" rx="6" fill={colors.bgAlt} />
    {([6, 14, 10, 18, 22, 16] as const).map((h, i) => (
      <Rect
        key={i}
        x={92 + i * 10}
        y={160 - h}
        width="6"
        height={h}
        rx="1.5"
        fill={[colors.primary, colors.success, colors.warning, colors.violet, colors.primary, colors.success][i]}
      />
    ))}
    <Rect x="88" y="170" width="40" height="4" rx="2" fill={colors.bgAlt} />

    {/* PKR coin */}
    <Circle cx="38" cy="160" r="16" fill={colors.warning} stroke="#fff" strokeWidth="2.5" />
    <SvgText x="38" y="166" textAnchor="middle" fontFamily={typography.fontFamily.bold} fontSize="13" fill="#fff">
      Rs
    </SvgText>
  </Svg>
);
