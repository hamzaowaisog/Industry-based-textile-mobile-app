import React from 'react';

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors } from '../../../src/theme/colors';

export const OnboardingSlide2 = () => (
  <Svg width={220} height={200} viewBox="0 0 220 200" fill="none">
    {/* Cloud */}
    <Path
      d="M60 90 a28 28 0 0 1 56 0 a23 23 0 0 1 38 5 a18 18 0 0 1 -12 32 H64 a22 22 0 0 1 -4 -37"
      fill="#fff"
      stroke={colors.success}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Sync arrow — left */}
    <Path d="M90 60 a20 20 0 1 1 -8 30" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <Path d="M85 90 L82 95 L77 92" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Sync arrow — right */}
    <Path d="M130 50 a20 20 0 1 0 8 30" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <Path d="M135 80 L138 85 L143 82" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Connecting dots */}
    {([0, 1, 2] as const).map((i) => (
      <Circle key={`a${i}`} cx={60 + i * 6} cy={140 - i * 3} r="1.6" fill={colors.success} />
    ))}
    {([0, 1, 2] as const).map((i) => (
      <Circle key={`b${i}`} cx={104 + i * 4} cy={140} r="1.6" fill={colors.success} />
    ))}
    {([0, 1, 2] as const).map((i) => (
      <Circle key={`c${i}`} cx={144 + i * 6} cy={140 - i * 3} r="1.6" fill={colors.success} />
    ))}

    {/* Device 1 — blue */}
    <Rect x="30" y="148" width="42" height="32" rx="6" fill={colors.primary} />
    <Rect x="34" y="152" width="34" height="22" rx="3" fill="#fff" />
    {([0, 1, 2] as const).map((i) => (
      <Rect key={i} x="38" y={156 + i * 5} width={20 + i * 4} height="2.5" rx="1" fill={colors.bgAlt} />
    ))}

    {/* Device 2 — orange (tablet) */}
    <Rect x="86" y="142" width="46" height="40" rx="6" fill={colors.warning} />
    <Rect x="90" y="146" width="38" height="32" rx="3" fill="#fff" />
    <Circle cx="109" cy="158" r="6" fill={colors.warningLight} />
    {([0, 1] as const).map((i) => (
      <Rect key={i} x="94" y={170 + i * 4} width={28 - i * 8} height="2.5" rx="1" fill={colors.bgAlt} />
    ))}

    {/* Device 3 — violet */}
    <Rect x="146" y="148" width="42" height="32" rx="6" fill={colors.violet} />
    <Rect x="150" y="152" width="34" height="22" rx="3" fill="#fff" />
    {([0, 1, 2] as const).map((i) => (
      <Rect key={i} x="154" y={156 + i * 5} width={20 + i * 4} height="2.5" rx="1" fill={colors.bgAlt} />
    ))}
  </Svg>
);
