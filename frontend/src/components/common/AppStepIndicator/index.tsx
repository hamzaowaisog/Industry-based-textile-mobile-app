import React from 'react';

import { Text, View } from 'react-native';

import { colors } from '@theme/colors';

import { CheckIcon } from '@constants/svgAssets';

import type { AppStepIndicatorProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppStepIndicator = ({ steps, current }: AppStepIndicatorProps) => (
  <View style={styles.track}>
    <View style={styles.nodesRow}>
      {steps.map((label, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <React.Fragment key={label}>
            <View style={styles.node}>
              <View
                style={[
                  styles.circle,
                  isDone && styles.circleDone,
                  isCurrent && styles.circleCurrent,
                ]}
              >
                {isDone ? (
                  <CheckIcon size={12} color={colors.white} />
                ) : (
                  <Text style={[styles.circleText, isCurrent && styles.circleTextCurrent]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[styles.label, isDone && styles.labelDone, isCurrent && styles.labelCurrent]}
              >
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && <View style={[styles.line, isDone && styles.lineFilled]} />}
          </React.Fragment>
        );
      })}
    </View>
  </View>
);
