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

import {
  ArrowLeftIcon,
  CheckIcon,
  LockIcon,
  MailIcon,
  WeavePattern,
} from '@constants/svgAssets';
import { colors } from '@theme/colors';
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

  const steps = [
    { Icon: MailIcon, bg: colors.primaryLight, color: colors.primary, label: t('forgotPassword.step1') },
    { Icon: LockIcon, bg: colors.warningLight, color: colors.warning, label: t('forgotPassword.step2') },
    { Icon: CheckIcon, bg: colors.successLight, color: colors.success, label: t('forgotPassword.step3') },
  ];

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.formCard}
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Email input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {t('forgotPassword.emailLabel')}<Text style={styles.requiredStar}> *</Text>
            </Text>
            <View style={[
              styles.inputRow,
              formik.touched.email && formik.errors.email ? styles.inputRowError : null,
            ]}>
              <View style={styles.inputLeading}>
                <MailIcon size={18} color={colors.textTertiary} />
              </View>
              <TextInput
                style={styles.input}
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                placeholder={t('forgotPassword.emailPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                onSubmitEditing={() => formik.handleSubmit()}
              />
            </View>
            {formik.touched.email && formik.errors.email ? (
              <Text style={styles.fieldError}>{formik.errors.email}</Text>
            ) : null}
          </View>

          {/* Step strip */}
          <View style={styles.stepStrip}>
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepIconBox, { backgroundColor: step.bg }]}>
                    <step.Icon size={18} color={step.color} />
                  </View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                </View>
                {i < steps.length - 1 && <View style={styles.stepConnector} />}
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
            {isPending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryButtonText}>{t('forgotPassword.sendLink')}</Text>
            }
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
