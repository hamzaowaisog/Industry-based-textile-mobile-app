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

import { colors } from '@theme/colors';

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
  onTogglePassword,
  onToggleRemember,
  onForgotPassword,
  onBiometric,
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
            <Text style={styles.brandName}>HamzaTex</Text>
            <Text style={styles.brandTag}>TEXTILE ERP</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.formCard}
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Username */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('login.usernameLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View
              style={[
                styles.inputRow,
                formik.touched.userName && formik.errors.userName ? styles.inputRowError : null,
              ]}
            >
              <View style={styles.inputLeading}>
                <MailIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                style={styles.input}
                value={formik.values.userName}
                onChangeText={formik.handleChange('userName')}
                onBlur={formik.handleBlur('userName')}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your username"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="blurAndSubmit"
              />
            </View>
            {formik.touched.userName && formik.errors.userName ? (
              <Text style={styles.fieldError}>{formik.errors.userName}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('login.passwordLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View
              style={[
                styles.inputRow,
                formik.touched.password && formik.errors.password ? styles.inputRowError : null,
              ]}
            >
              <View style={styles.inputLeading}>
                <LockIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                ref={passwordRef}
                style={[styles.input, styles.inputWithTrailing]}
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                onSubmitEditing={() => formik.handleSubmit()}
              />
              <TouchableOpacity
                style={styles.inputTrailing}
                onPress={onTogglePassword}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
            {formik.touched.password && formik.errors.password ? (
              <Text style={styles.fieldError}>{formik.errors.password}</Text>
            ) : null}
          </View>

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

          {/* OR divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('login.orDivider')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Biometric */}
          <TouchableOpacity style={styles.ghostButton} onPress={onBiometric} activeOpacity={0.8}>
            <FingerprintIcon size={20} color={colors.text} />
            <Text style={styles.ghostButtonText}>{t('login.biometric')}</Text>
          </TouchableOpacity>

          {/* Request access */}
          <View style={styles.requestRow}>
            <Text style={styles.requestText}>{t('login.newUser')} </Text>
            <TouchableOpacity activeOpacity={0.7}>
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
