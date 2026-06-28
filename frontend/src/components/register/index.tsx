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
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('register.nameLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View
              style={[
                styles.inputRow,
                formik.touched.name && formik.errors.name ? styles.inputRowError : null,
              ]}
            >
              <View style={styles.inputLeading}>
                <MailIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                style={styles.input}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                autoCapitalize="words"
                autoCorrect={false}
                placeholder={t('register.namePlaceholder')}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
            {formik.touched.name && formik.errors.name ? (
              <Text style={styles.fieldError}>{formik.errors.name}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('register.emailLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View
              style={[
                styles.inputRow,
                formik.touched.email && formik.errors.email ? styles.inputRowError : null,
              ]}
            >
              <View style={styles.inputLeading}>
                <MailIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                ref={emailRef}
                style={styles.input}
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                placeholder={t('register.emailPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => usernameRef.current?.focus()}
              />
            </View>
            {formik.touched.email && formik.errors.email ? (
              <Text style={styles.fieldError}>{formik.errors.email}</Text>
            ) : null}
          </View>

          {/* Username */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('register.usernameLabel')}
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
                ref={usernameRef}
                style={styles.input}
                value={formik.values.userName}
                onChangeText={formik.handleChange('userName')}
                onBlur={formik.handleBlur('userName')}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t('register.usernamePlaceholder')}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>
            {formik.touched.userName && formik.errors.userName ? (
              <Text style={styles.fieldError}>{formik.errors.userName}</Text>
            ) : null}
          </View>

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('register.phoneLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View
              style={[
                styles.inputRow,
                formik.touched.phoneNumber && formik.errors.phoneNumber
                  ? styles.inputRowError
                  : null,
              ]}
            >
              <View style={styles.inputLeading}>
                <MailIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                ref={phoneRef}
                style={styles.input}
                value={formik.values.phoneNumber}
                onChangeText={formik.handleChange('phoneNumber')}
                onBlur={formik.handleBlur('phoneNumber')}
                keyboardType="numeric"
                placeholder={t('register.phonePlaceholder')}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
            {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
              <Text style={styles.fieldError}>{formik.errors.phoneNumber}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('register.passwordLabel')}
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
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('register.confirmPasswordLabel')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View
              style={[
                styles.inputRow,
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? styles.inputRowError
                  : null,
              ]}
            >
              <View style={styles.inputLeading}>
                <LockIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, styles.inputWithTrailing]}
                value={formik.values.confirmPassword}
                onChangeText={formik.handleChange('confirmPassword')}
                onBlur={formik.handleBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                placeholder={t('register.confirmPasswordPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                onSubmitEditing={() => formik.handleSubmit()}
              />
              <TouchableOpacity
                style={styles.inputTrailing}
                onPress={onToggleConfirmPassword}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <Text style={styles.fieldError}>{formik.errors.confirmPassword}</Text>
            ) : null}
          </View>

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
