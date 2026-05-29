import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import Svg from 'react-native-svg';

import { colors } from '@theme/colors';

import { height, splashStyles, width } from './SplashScreen.styles';

// ─── Weave Pattern ────────────────────────────────────────────────────────────
const WeavePattern = () => (
  <Svg width={width} height={height} style={splashStyles.weavePattern}>
    <Defs>
      <Pattern id="weave" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
        <Path d="M0 16 L32 16 M16 0 L16 32" stroke="#fff" strokeOpacity={0.06} strokeWidth={0.6} />
        <Circle cx="16" cy="16" r="1.4" fill="#fff" fillOpacity={0.12} />
      </Pattern>
    </Defs>
    <Rect width={width} height={height} fill="url(#weave)" />
  </Svg>
);

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = ({ size = 56, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="10" y="8" width="8" height="48" rx="4" fill={color} />
    <Rect x="46" y="8" width="8" height="48" rx="4" fill={color} />
    <Rect x="6" y="26" width="52" height="12" rx="6" fill={color} opacity="0.32" />
    <Circle cx="32" cy="32" r="6" fill={color} />
  </Svg>
);

// ─── Pulse Ring ───────────────────────────────────────────────────────────────
const PulseRing = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scale, { toValue: 1, duration: 2600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, { toValue: 0, duration: 2600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View style={[splashStyles.pulseRing, { transform: [{ scale }], opacity }]} />
  );
};

// ─── Loading Dot ──────────────────────────────────────────────────────────────
const LoadingDot = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]),
    ).start();
  }, [delay, opacity]);

  return <Animated.View style={[splashStyles.dot, { opacity }]} />;
};

// ─── Splash Screen ────────────────────────────────────────────────────────────
export const SplashScreen = () => (
  <LinearGradient
    colors={[colors.primary, colors.primaryDark, colors.primaryDeep]}
    locations={[0, 0.75, 1]}
    start={{ x: 0.2, y: 0 }}
    end={{ x: 0.8, y: 1 }}
    style={splashStyles.container}
  >
    <WeavePattern />
    <View style={splashStyles.orbTopLeft} />
    <View style={splashStyles.orbBottomRight} />

    <View style={splashStyles.centerContent}>
      <View style={splashStyles.logoWrapper}>
        <PulseRing delay={0} />
        <PulseRing delay={500} />
        <PulseRing delay={1000} />
        <View style={splashStyles.logoBox}>
          <Logo size={62} color="#fff" />
        </View>
      </View>
      <Text style={splashStyles.brandName}>HamzaTex</Text>
      <Text style={splashStyles.tagline}>TEXTILE ERP · MOBILE</Text>
    </View>

    <View style={splashStyles.bottom}>
      <View style={splashStyles.dotsRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <LoadingDot key={i} delay={i * 120} />
        ))}
      </View>
      <Text style={splashStyles.version}>v1.0.0 · MADE IN KARACHI</Text>
    </View>
  </LinearGradient>
);
