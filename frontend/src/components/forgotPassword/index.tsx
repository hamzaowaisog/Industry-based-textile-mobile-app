import React from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';

import { FORGOT_PASSWORD_STEPS } from '@utils/helpers/forgotPasswordContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, MailIcon, WeavePattern } from '@constants/svgAssets';

import { ForgotPasswordComponentProps } from '../../types/forgotPassword.types';
import { styles } from './styles';

export const ForgotPasswordComponent = ({
  formik,
  isPending,
  onBack,
  onSignIn,
}: ForgotPasswordComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Gradient hero */}
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
                <MailIcon size={34} color="#fff" />
              </View>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>?</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t('forgotPassword.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('forgotPassword.subtitle')}</Text>
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
          {/* Email input */}
          <AppInputField
            label={t('forgotPassword.emailLabel')}
            required
            leading={<MailIcon size={18} color={colors.textTertiary} />}
            value={formik.values.email}
            onChangeText={(v) => void formik.setFieldValue('email', v)}
            onBlur={() => formik.setFieldTouched('email', true)}
            placeholder={t('forgotPassword.emailPlaceholder')}
            error={formik.touched.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => formik.handleSubmit()}
          />

          {/* Step strip */}
          <View style={styles.stepStrip}>
            {FORGOT_PASSWORD_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepIconBox, { backgroundColor: step.bg }]}>
                    <step.Icon size={18} color={step.color} />
                  </View>
                  <Text style={styles.stepLabel}>{t(step.labelKey)}</Text>
                </View>
                {i < FORGOT_PASSWORD_STEPS.length - 1 && <View style={styles.stepConnector} />}
              </React.Fragment>
            ))}
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
              <Text style={styles.primaryButtonText}>{t('forgotPassword.sendLink')}</Text>
            )}
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>{t('forgotPassword.rememberPassword')} </Text>
            <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
              <Text style={styles.signInLink}>{t('forgotPassword.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
