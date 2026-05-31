import { Dimensions, StyleSheet } from 'react-native';

import { typography } from '@theme/typography';

const { width, height } = Dimensions.get('window');

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  weavePattern: {
    ...StyleSheet.absoluteFillObject,
  },
  orbTopLeft: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -120,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoBox: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  brandName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 42,
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  tagline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 12,
    letterSpacing: 2.6,
  },
  bottom: {
    paddingBottom: 32,
    alignItems: 'center',
    gap: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  version: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.6,
  },
});

export { width, height };
