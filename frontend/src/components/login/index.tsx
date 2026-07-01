import React, { useRef } from 'react';

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

import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  LockIcon,
  LogoIcon,
  MailIcon,
  WeavePattern,
} from '@constants/svgAssets';

import { LoginComponentProps } from '../../types/login.types';
import { styles } from './styles';

export const LoginComponent = ({
  formik,
  showPassword,
  rememberMe,
  isBiometricEnabled,
  onTogglePassword,
  onToggleRemember,
  onForgotPassword,
  onBiometric,
  onRequestAccess,
}: LoginComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      {/* Hero */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0.7, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <WeavePattern />
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomRight} />

        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <LogoIcon size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandName}>{AppConstants.APP.NAME}</Text>
            <Text style={styles.brandTag}>{AppConstants.APP.TAG}</Text>
          </View>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t('login.welcomeBack')}</Text>
          <Text style={styles.heroSubtitle}>{t('login.subtitle')}</Text>
        </View>
      </LinearGradient>

      {/* Form card */}
      <KeyboardAvoidingView
        style={styles.formCardWrapper}
        behavior={Platform.OS === AppConstants.PLATFORM.OS.IOS ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.formCard}
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Username */}
          <AppInputField
            label={t('login.usernameLabel')}
            required
            leading={<MailIcon size={18} color={colors.textTertiary} />}
            value={formik.values.userName}
            onChangeText={(v) => void formik.setFieldValue('userName', v)}
            onBlur={() => formik.setFieldTouched('userName', true)}
            placeholder={t('login.usernamePlaceholder')}
            error={formik.touched.userName ? formik.errors.userName : undefined}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            submitBehavior="blurAndSubmit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          {/* Password */}
          <AppInputField
            ref={passwordRef}
            label={t('login.passwordLabel')}
            required
            leading={<LockIcon size={18} color={colors.textTertiary} />}
            trailing={
              <TouchableOpacity
                onPress={onTogglePassword}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              >
                {showPassword ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showPassword}
            value={formik.values.password}
            onChangeText={(v) => void formik.setFieldValue('password', v)}
            onBlur={() => formik.setFieldTouched('password', true)}
            placeholder="••••••••"
            error={formik.touched.password ? formik.errors.password : undefined}
            returnKeyType="done"
            onSubmitEditing={() => formik.handleSubmit()}
          />

          {/* Remember + Forgot */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.rememberBtn}
              onPress={onToggleRemember}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <CheckIcon size={12} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>{t('login.rememberMe')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In */}
          <TouchableOpacity
            style={[styles.primaryButton, formik.isSubmitting && styles.primaryButtonDisabled]}
            onPress={() => formik.handleSubmit()}
            activeOpacity={0.85}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>{t('login.signIn')}</Text>
                <ArrowRightIcon size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Trust line */}
          <View style={styles.trustRow}>
            <LockIcon size={13} color={colors.success} />
            <Text style={styles.trustText}>{t('login.trustLine')}</Text>
          </View>

          {/* Biometric — only shown when biometric is set up */}
          {isBiometricEnabled && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('login.orDivider')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.ghostButton}
                onPress={onBiometric}
                activeOpacity={0.8}
              >
                <FingerprintIcon size={20} color={colors.text} />
                <Text style={styles.ghostButtonText}>{t('login.biometric')}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Request access */}
          <View style={styles.requestRow}>
            <Text style={styles.requestText}>{t('login.newUser')} </Text>
            <TouchableOpacity onPress={onRequestAccess} activeOpacity={0.7}>
              <Text style={styles.requestLink}>{t('login.requestAccess')}</Text>
            </TouchableOpacity>
          </View>

          {/* Version */}
          <Text style={styles.versionText}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
