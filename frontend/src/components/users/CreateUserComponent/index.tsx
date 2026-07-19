import React, { useRef } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';

import { getInitials } from '@utils/helpers/textHelpers';
import { ROLE_OPTIONS } from '@utils/helpers/userContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
} from '@constants/svgAssets';

import type { CreateUserComponentProps } from '../../../types/users.types';
import { styles } from './styles';

export const CreateUserComponent = ({
  values,
  errors,
  touched,
  submitting,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  onCancel,
}: CreateUserComponentProps) => {
  const { t } = useTranslation();
  const emailRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const userNameRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const phoneRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const passwordRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const confirmPasswordRef = useRef<React.ComponentRef<typeof AppInputField>>(null);

  const err = (field: string) => (touched[field] ? errors[field] : undefined);
  const isAdmin = values.roleId === AppConstants.ROLES.ADMIN;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onCancel} activeOpacity={0.7}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{t('users.createTitle')}</Text>
            <Text style={styles.headerSub}>{t('users.createSubtitle')}</Text>
          </View>
        </View>

        <AppKeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
        >
          <View style={styles.avatarPreviewWrap}>
            <View
              style={[
                styles.avatarPreview,
                { backgroundColor: isAdmin ? colors.primary : colors.success },
              ]}
            >
              <Text style={styles.avatarPreviewText}>
                {values.name.trim() ? getInitials(values.name) : '?'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('users.identitySection')}</Text>
            <AppInputField
              label={t('users.fieldName')}
              required
              value={values.name}
              onChangeText={(v) => setFieldValue('name', v)}
              onBlur={() => setFieldTouched('name', true)}
              placeholder={t('users.fieldNamePlaceholder')}
              error={err('name')}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <AppInputField
              ref={emailRef}
              label={t('users.fieldEmail')}
              required
              value={values.email}
              onChangeText={(v) => setFieldValue('email', v)}
              onBlur={() => setFieldTouched('email', true)}
              placeholder={t('users.fieldEmailPlaceholder')}
              error={err('email')}
              leading={<MailIcon size={18} color={colors.textTertiary} />}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => userNameRef.current?.focus()}
            />
            <AppInputField
              ref={userNameRef}
              label={t('users.fieldUserName')}
              required
              value={values.userName}
              onChangeText={(v) => setFieldValue('userName', v)}
              onBlur={() => setFieldTouched('userName', true)}
              placeholder={t('users.fieldUserNamePlaceholder')}
              error={err('userName')}
              leading={<UserIcon size={18} color={colors.textTertiary} />}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <AppInputField
              ref={phoneRef}
              label={t('users.fieldPhone')}
              value={values.phoneNumber}
              onChangeText={(v) => setFieldValue('phoneNumber', v)}
              onBlur={() => setFieldTouched('phoneNumber', true)}
              placeholder={t('users.fieldPhonePlaceholder')}
              error={err('phoneNumber')}
              leading={<PhoneIcon size={18} color={colors.textTertiary} />}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <AppInputField
              ref={passwordRef}
              label={t('users.fieldPassword')}
              required
              value={values.password}
              onChangeText={(v) => setFieldValue('password', v)}
              onBlur={() => setFieldTouched('password', true)}
              placeholder="••••••••"
              error={err('password')}
              helper={t('users.passwordHelper')}
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
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
            <AppInputField
              ref={confirmPasswordRef}
              label={t('users.fieldConfirmPassword')}
              required
              value={values.confirmPassword}
              onChangeText={(v) => setFieldValue('confirmPassword', v)}
              onBlur={() => setFieldTouched('confirmPassword', true)}
              placeholder="••••••••"
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
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <View style={styles.sectionGap} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('users.roleSection')}</Text>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((opt) => {
                const active = values.roleId === opt.id;
                const optColor = opt.id === AppConstants.ROLES.ADMIN ? colors.primary : colors.success;
                const Icon = opt.id === AppConstants.ROLES.ADMIN ? StarIcon : UserIcon;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.roleCard,
                      { borderColor: active ? optColor : colors.border },
                      active && { backgroundColor: `${optColor}15` },
                    ]}
                    onPress={() => setFieldValue('roleId', opt.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleIconTile,
                        { backgroundColor: active ? optColor : colors.bgAlt },
                      ]}
                    >
                      <Icon size={18} color={active ? colors.surface : colors.textSecondary} />
                    </View>
                    <Text style={[styles.roleTitle, active && { color: optColor }]}>
                      {t(opt.labelKey)}
                    </Text>
                    <Text style={styles.roleDesc}>{t(opt.descKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionGap} />

          <View style={styles.noticeCard}>
            <InfoIcon size={18} color={colors.primary} />
            <Text style={styles.noticeText}>{t('users.preConfirmedNotice')}</Text>
          </View>
        </AppKeyboardAwareScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.btnGhost} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.btnGhostText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSuccess, submitting && styles.btnSuccessDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={submitting}
          >
            <Text style={styles.btnSuccessText}>
              {submitting ? t('common.saving') : t('users.createAccountBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
