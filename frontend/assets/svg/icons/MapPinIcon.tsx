import Svg, { Circle, Path } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const MapPinIcon = ({ size = 20, color = '#111827' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);
