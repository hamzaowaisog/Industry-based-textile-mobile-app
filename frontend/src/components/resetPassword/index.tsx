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

import { PASSWORD_RULES } from '@utils/helpers/passwordRules';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LockIcon, WeavePattern } from '@constants/svgAssets';

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
        behavior={Platform.OS === AppConstants.PLATFORM.OS.IOS ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.formCard}
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* New password */}
          <AppInputField
            label={t('resetPassword.newPasswordLabel')}
            required
            leading={<LockIcon size={18} color={colors.textTertiary} />}
            trailing={
              <TouchableOpacity
                onPress={onToggleNew}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              >
                {showNew ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showNew}
            value={formik.values.newPassword}
            onChangeText={(v) => void formik.setFieldValue('newPassword', v)}
            onBlur={() => formik.setFieldTouched('newPassword', true)}
            placeholder={t('resetPassword.newPasswordPlaceholder')}
            error={formik.touched.newPassword ? formik.errors.newPassword : undefined}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />

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
          <AppInputField
            ref={confirmRef}
            label={t('resetPassword.confirmPasswordLabel')}
            required
            leading={<LockIcon size={18} color={colors.textTertiary} />}
            trailing={
              <TouchableOpacity
                onPress={onToggleConfirm}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              >
                {showConfirm ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showConfirm}
            value={formik.values.confirmPassword}
            onChangeText={(v) => void formik.setFieldValue('confirmPassword', v)}
            onBlur={() => formik.setFieldTouched('confirmPassword', true)}
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
            error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
            autoCapitalize="none"
            autoCorrect={false}
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
              <Text style={styles.primaryButtonText}>{t('resetPassword.submit')}</Text>
            )}
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
