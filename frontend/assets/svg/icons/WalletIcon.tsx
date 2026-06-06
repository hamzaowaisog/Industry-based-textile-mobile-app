import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

export const WalletIcon = ({ size = 20, color = '#111827' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V8H6a2 2 0 0 1-2-2V18a2 2 0 0 0 2 2h14v-4"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M20 12h-4a2 2 0 0 0 0 4h4M4 6V4a1 1 0 0 1 1-1h11v3"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);
