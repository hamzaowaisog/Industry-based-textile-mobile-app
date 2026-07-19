import React, { useRef } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';

import { PASSWORD_RULES } from '@utils/helpers/passwordRules';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon } from '@constants/svgAssets';

import type { ChangePasswordComponentProps } from '../../../types/changePassword.types';
import { styles } from './styles';

export const ChangePasswordComponent = ({
  values,
  errors,
  touched,
  submitting,
  showOldPassword,
  showNewPassword,
  showConfirmPassword,
  onToggleOldPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  onCancel,
}: ChangePasswordComponentProps) => {
  const { t } = useTranslation();
  const newPasswordRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const confirmPasswordRef = useRef<React.ComponentRef<typeof AppInputField>>(null);

  const err = (field: string) => (touched[field] ? errors[field] : undefined);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onCancel} activeOpacity={0.7}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('changePassword.title')}</Text>
        </View>

        <AppKeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
        >
          <AppInputField
            label={t('changePassword.oldPasswordLabel')}
            required
            value={values.oldPassword}
            onChangeText={(v) => setFieldValue('oldPassword', v)}
            onBlur={() => setFieldTouched('oldPassword', true)}
            placeholder={t('changePassword.oldPasswordPlaceholder')}
            error={err('oldPassword')}
            leading={<LockIcon size={18} color={colors.textTertiary} />}
            trailing={
              <TouchableOpacity
                onPress={onToggleOldPassword}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              >
                {showOldPassword ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showOldPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />

          <AppInputField
            ref={newPasswordRef}
            label={t('changePassword.newPasswordLabel')}
            required
            value={values.newPassword}
            onChangeText={(v) => setFieldValue('newPassword', v)}
            onBlur={() => setFieldTouched('newPassword', true)}
            placeholder={t('changePassword.newPasswordPlaceholder')}
            error={err('newPassword')}
            leading={<LockIcon size={18} color={colors.textTertiary} />}
            trailing={
              <TouchableOpacity
                onPress={onToggleNewPassword}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              >
                {showNewPassword ? (
                  <EyeOffIcon size={18} color={colors.textTertiary} />
                ) : (
                  <EyeIcon size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          {values.newPassword.length > 0 && (
            <View style={styles.rulesWrap}>
              {PASSWORD_RULES.map((rule) => {
                const met = rule.met(values.newPassword);
                return (
                  <View key={rule.labelKey} style={[styles.ruleChip, met && styles.ruleChipMet]}>
                    {met ? (
                      <CheckIcon size={12} color={colors.success} />
                    ) : (
                      <View style={styles.ruleDot} />
                    )}
                    <Text style={[styles.ruleText, met && styles.ruleTextMet]}>
                      {t(rule.labelKey)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <AppInputField
            ref={confirmPasswordRef}
            label={t('changePassword.confirmPasswordLabel')}
            required
            value={values.confirmPassword}
            onChangeText={(v) => setFieldValue('confirmPassword', v)}
            onBlur={() => setFieldTouched('confirmPassword', true)}
            placeholder={t('changePassword.confirmPasswordPlaceholder')}
            error={err('confirmPassword')}
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
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </AppKeyboardAwareScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.btnGhost} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.btnGhostText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnPrimary, submitting && styles.btnPrimaryDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={submitting}
          >
            <Text style={styles.btnPrimaryText}>
              {submitting ? t('common.saving') : t('changePassword.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
