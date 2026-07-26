import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { IconProps } from '../../../src/types/icon.types';

/**
 * Classic address-book icon: book cover with three binding tabs on the right
 * edge (the alphabetical divider tabs from a physical address book) and a
 * person silhouette on the cover.
 */
export const AddressBookIcon = ({ size = 20, color = '#111827', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Book cover */}
    <Rect
      x="3"
      y="2"
      width="15"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />

    {/* Three alphabetical divider tabs on the right edge */}
    <Path
      d="M18 5.5h3v3h-3z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Path
      d="M18 10.5h3v3h-3z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Path
      d="M18 15.5h3v3h-3z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />

    {/* Person silhouette on the cover */}
    <Circle cx="10.5" cy="9" r="2" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M6.5 16.5a4 4 0 0 1 8 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);
