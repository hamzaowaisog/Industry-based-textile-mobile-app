import React from 'react';
import { View } from 'react-native';

import { BaseToast, BaseToastProps } from 'react-native-toast-message';

import { CheckIcon, LockIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { LeadingIconProps, XIconProps } from '../../../types/toast.types';

import { toastStyles, xIconStyles } from './styles';

const XIcon = ({ size = 18 }: XIconProps) => {
  const armWidth = size * 0.55;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[xIconStyles.arm, { width: armWidth, transform: [{ rotate: '45deg' }] }]} />
      <View style={[xIconStyles.arm, { width: armWidth, transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
};

const LeadingIcon = ({ bg, Icon }: LeadingIconProps) => (
  <View style={toastStyles.iconCircle(bg)}>
    <Icon size={18} color="#fff" />
  </View>
);

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={toastStyles.card(colors.success)}
      renderLeadingIcon={() => <LeadingIcon bg={colors.success} Icon={CheckIcon} />}
      text1Style={toastStyles.text1}
      text2Style={toastStyles.text2}
      text2NumberOfLines={3}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={toastStyles.card(colors.danger)}
      renderLeadingIcon={() => <LeadingIcon bg={colors.danger} Icon={XIcon} />}
      text1Style={toastStyles.text1}
      text2Style={toastStyles.text2}
      text2NumberOfLines={3}
    />
  ),
  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={toastStyles.card(colors.warning)}
      renderLeadingIcon={() => <LeadingIcon bg={colors.warning} Icon={LockIcon} />}
      text1Style={toastStyles.text1}
      text2Style={toastStyles.text2}
      text2NumberOfLines={3}
    />
  ),
};
