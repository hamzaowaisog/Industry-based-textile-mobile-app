import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const ArrowDownIcon = ({ size = 20, color = '#111827' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12l7 7 7-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
