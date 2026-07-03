import Svg, { Path } from 'react-native-svg';

type Props = { size?: number; color?: string };

export const ShareIcon = ({ size = 24, color = 'currentColor' }: Props) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M12 15V3" />
    <Path d="M8 7l4-4 4 4" />
    <Path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5" />
  </Svg>
);
