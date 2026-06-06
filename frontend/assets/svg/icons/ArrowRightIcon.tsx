import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const ArrowRightIcon = ({ size = 18, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
