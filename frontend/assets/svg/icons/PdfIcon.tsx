import Svg, { Path } from 'react-native-svg';

type Props = { size?: number; color?: string };

export const PdfIcon = ({ size = 24, color = 'currentColor' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6" />
    <Path d="M12 18v-6" />
    <Path d="M9 15l3 3 3-3" />
  </Svg>
);
