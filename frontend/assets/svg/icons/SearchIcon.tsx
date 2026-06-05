import Svg, { Circle, Line } from 'react-native-svg';

type Props = { size?: number; color?: string };

export const SearchIcon = ({ size = 20, color = '#111827' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="16.5" y1="16.5" x2="22" y2="22" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
