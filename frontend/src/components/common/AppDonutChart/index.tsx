import React from 'react';

import { View } from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { AppDonutChartProps } from '../../../types/common.types';
import { styles } from './styles';

const { STROKE_WIDTH, START_ROTATION_DEGREES } = AppConstants.DONUT;

export const AppDonutChart = ({ slices, size }: AppDonutChartProps) => {
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const center = size / 2;

  let offset = 0;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.bgAlt}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {total > 0 &&
          slices.map((slice, i) => {
            const fraction = slice.value / total;
            const dash = fraction * circumference;
            const dashOffset = -offset;
            offset += dash;
            return (
              <Circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                stroke={slice.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                originX={center}
                originY={center}
                rotation={START_ROTATION_DEGREES}
              />
            );
          })}
      </Svg>
    </View>
  );
};
