import React from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, LockIcon, WeavePattern } from '@constants/svgAssets';

import { OtpVerificationComponentProps } from '../../types/otpVerification.types';
import { styles } from './styles';

export const OtpVerificationComponent = ({
  formik,
  isPending,
  email,
  digits,
  focusedIndex,
  inputRefs,
  secondsLeft,
  canResend,
  isResending,
  onDigitChange,
  onKeyPress,
  onFocus,
  onBlur,
  onResend,
  onBack,
}: OtpVerificationComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0.7, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
      >
        <WeavePattern />
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />

        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.heroIconArea}>
          <View style={styles.heroRingOuter}>
            <View style={styles.heroRingInner}>
              <View style={styles.heroIconCore}>
                <LockIcon size={32} color="#fff" />
              </View>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>✓</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t('otpVerification.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('otpVerification.subtitle')}</Text>
          <Text style={styles.heroEmail}>{email}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formCardWrapper}
        behavior={Platform.OS === AppConstants.PLATFORM.OS.IOS ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.formCard}
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* OTP boxes */}
          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>
              {t('otpVerification.codeLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View style={styles.otpRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => {
                    inputRefs.current[i] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    focusedIndex === i && styles.otpBoxFocused,
                    digit ? styles.otpBoxFilled : null,
                    styles.otpBoxText,
                  ]}
                  value={digit}
                  onChangeText={(text) => onDigitChange(text, i)}
                  onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key, i)}
                  onFocus={() => onFocus(i)}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  autoComplete="one-time-code"
                />
              ))}
            </View>
            {formik.touched.code && formik.errors.code ? (
              <Text style={styles.fieldError}>{formik.errors.code}</Text>
            ) : null}
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>
              {canResend
                ? t('otpVerification.didntReceive')
                : t('otpVerification.resendIn', { seconds: secondsLeft })}
            </Text>
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={onResend}
              disabled={!canResend || isResending}
              activeOpacity={0.7}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.resendBtnText, !canResend && styles.resendBtnDisabledText]}>
                  {t('otpVerification.resendCode')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isPending || formik.values.code.length < AppConstants.OTP.LENGTH) &&
                styles.primaryButtonDisabled,
            ]}
            onPress={() => formik.handleSubmit()}
            activeOpacity={0.85}
            disabled={isPending || formik.values.code.length < AppConstants.OTP.LENGTH}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('otpVerification.verify')}</Text>
            )}
          </TouchableOpacity>

          {/* Back to login */}
          <View style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>{t('otpVerification.backToPrefix')}</Text>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.backToLoginLink}>{t('otpVerification.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
