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

import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LockIcon, WeavePattern } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { PASSWORD_RULES } from '@utils/helpers/passwordRules';
import { ResetPasswordComponentProps } from '../../types/resetPassword.types';

import { styles } from './styles';

export const ResetPasswordComponent = ({
  formik,
  isPending,
  showNew,
  showConfirm,
  onToggleNew,
  onToggleConfirm,
  onBack,
}: ResetPasswordComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const confirmRef = useRef<TextInput>(null);
  const pw = formik.values.newPassword;

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
          <Text style={styles.heroTitle}>{t('resetPassword.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('resetPassword.subtitle')}</Text>
        </View>
      </LinearGradient>

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
          {/* New password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('resetPassword.newPasswordLabel')}<Text style={styles.requiredStar}> *</Text>
            </Text>
            <View style={[
              styles.inputRow,
              formik.touched.newPassword && formik.errors.newPassword ? styles.inputRowError : null,
            ]}>
              <View style={styles.inputLeading}>
                <LockIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                style={[styles.input, styles.inputWithTrailing]}
                value={formik.values.newPassword}
                onChangeText={formik.handleChange('newPassword')}
                onBlur={formik.handleBlur('newPassword')}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity style={styles.inputTrailing} onPress={onToggleNew} activeOpacity={0.7}>
                {showNew
                  ? <EyeOffIcon size={18} color={colors.textTertiary} />
                  : <EyeIcon size={18} color={colors.textTertiary} />
                }
              </TouchableOpacity>
            </View>
            {formik.touched.newPassword && formik.errors.newPassword ? (
              <Text style={styles.fieldError}>{formik.errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Password rules — only shown while typing */}
          {pw.length > 0 && (
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>{t('resetPassword.passwordRequirements')}</Text>
              {PASSWORD_RULES.map((rule) => (
                <View key={rule.labelKey} style={styles.ruleRow}>
                  <View style={[styles.ruleDot, rule.met(pw) && styles.ruleDotMet]} />
                  <Text style={[styles.ruleText, rule.met(pw) && styles.ruleTextMet]}>
                    {t(rule.labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Confirm password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('resetPassword.confirmPasswordLabel')}<Text style={styles.requiredStar}> *</Text>
            </Text>
            <View style={[
              styles.inputRow,
              formik.touched.confirmPassword && formik.errors.confirmPassword ? styles.inputRowError : null,
            ]}>
              <View style={styles.inputLeading}>
                <LockIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                ref={confirmRef}
                style={[styles.input, styles.inputWithTrailing]}
                value={formik.values.confirmPassword}
                onChangeText={formik.handleChange('confirmPassword')}
                onBlur={formik.handleBlur('confirmPassword')}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => formik.handleSubmit()}
              />
              <TouchableOpacity style={styles.inputTrailing} onPress={onToggleConfirm} activeOpacity={0.7}>
                {showConfirm
                  ? <EyeOffIcon size={18} color={colors.textTertiary} />
                  : <EyeIcon size={18} color={colors.textTertiary} />
                }
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
            {isPending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryButtonText}>{t('resetPassword.submit')}</Text>
            }
          </TouchableOpacity>

          {/* Back to login */}
          <View style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>{t('resetPassword.backToPrefix')}</Text>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.backToLoginLink}>{t('resetPassword.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
