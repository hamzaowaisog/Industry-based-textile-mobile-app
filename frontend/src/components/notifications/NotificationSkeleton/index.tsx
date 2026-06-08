import { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { SkeletonBlock } from '../../dashboard/SkeletonBlock';
import { styles } from './styles';

const ROW_COUNT = 6;

const SkeletonRow = () => (
  <View style={styles.row}>
    <SkeletonBlock width={44} height={44} borderRadius={13} />
    <View style={styles.content}>
      <SkeletonBlock height={14} borderRadius={6} stretch />
      <SkeletonBlock flex={0.7} height={12} borderRadius={6} />
    </View>
    <SkeletonBlock width={30} height={10} borderRadius={5} />
  </View>
);

export const NotificationSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View style={styles.wrap}>
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    </Animated.View>
  );
};
