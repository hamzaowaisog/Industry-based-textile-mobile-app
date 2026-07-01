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

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  WeavePattern,
} from '@constants/svgAssets';

import { RegisterComponentProps } from '../../types/register.types';
import { styles } from './styles';

export const RegisterComponent = ({
  formik,
  isPending,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  onBack,
  onSignIn,
}: RegisterComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const emailRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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
                <MailIcon size={32} color="#fff" />
              </View>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>+</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t('register.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('register.subtitle')}</Text>
        </View>
      </LinearGradient>

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
          {/* Full Name */}
          <AppInputField
            label={t('register.nameLabel')}
            required
            leading={<MailIcon size={18} color={colors.textTertiary} />}
            value={formik.values.name}
            onChangeText={(v) => void formik.setFieldValue('name', v)}
            onBlur={() => formik.setFieldTouched('name', true)}
            placeholder={t('register.namePlaceholder')}
            error={formik.touched.name ? formik.errors.name : undefined}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          {/* Email */}
          <AppInputField
            ref={emailRef}
            label={t('register.emailLabel')}
            required
            leading={<MailIcon size={18} color={colors.textTertiary} />}
            value={formik.values.email}
            onChangeText={(v) => void formik.setFieldValue('email', v)}
            onBlur={() => formik.setFieldTouched('email', true)}
            placeholder={t('register.emailPlaceholder')}
            error={formik.touched.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => usernameRef.current?.focus()}
          />

          {/* Username */}
          <AppInputField
            ref={usernameRef}
            label={t('register.usernameLabel')}
            required
            leading={<MailIcon size={18} color={colors.textTertiary} />}
            value={formik.values.userName}
            onChangeText={(v) => void formik.setFieldValue('userName', v)}
            onBlur={() => formik.setFieldTouched('userName', true)}
            placeholder={t('register.usernamePlaceholder')}
            error={formik.touched.userName ? formik.errors.userName : undefined}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />

          {/* Phone Number */}
          <AppInputField
            ref={phoneRef}
            label={t('register.phoneLabel')}
            required
            leading={<MailIcon size={18} color={colors.textTertiary} />}
            value={formik.values.phoneNumber}
            onChangeText={(v) => void formik.setFieldValue('phoneNumber', v)}
            onBlur={() => formik.setFieldTouched('phoneNumber', true)}
            placeholder={t('register.phonePlaceholder')}
            error={formik.touched.phoneNumber ? formik.errors.phoneNumber : undefined}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          {/* Password */}
          <AppInputField
            ref={passwordRef}
            label={t('register.passwordLabel')}
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
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          {/* Confirm Password */}
          <AppInputField
            ref={confirmPasswordRef}
            label={t('register.confirmPasswordLabel')}
            required
            leading={<LockIcon size={18} color={colors.textTertiary} />}
            trailing={
              <TouchableOpacity
                onPress={onToggleConfirmPassword}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showConfirmPassword}
            value={formik.values.confirmPassword}
            onChangeText={(v) => void formik.setFieldValue('confirmPassword', v)}
            onBlur={() => formik.setFieldTouched('confirmPassword', true)}
            placeholder={t('register.confirmPasswordPlaceholder')}
            error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
            returnKeyType="done"
            onSubmitEditing={() => formik.handleSubmit()}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryButton, isPending && styles.primaryButtonDisabled]}
            onPress={() => formik.handleSubmit()}
            activeOpacity={0.85}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('register.submit')}</Text>
            )}
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>{t('register.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
              <Text style={styles.signInLink}>{t('register.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
