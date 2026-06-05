import { View } from 'react-native';

import type { SkeletonBlockProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const SkeletonBlock = ({
  width,
  height,
  borderRadius = 8,
  flex,
  stretch,
}: SkeletonBlockProps) => (
  <View
    style={[
      styles.block,
      {
        width,
        height,
        borderRadius,
        flex,
        alignSelf: stretch ? 'stretch' : undefined,
      },
    ]}
  />
);
