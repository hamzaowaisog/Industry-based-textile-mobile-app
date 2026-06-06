import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const PlusIcon = ({ size = 20, color = '#111827' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
