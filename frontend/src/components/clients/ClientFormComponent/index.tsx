import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';

import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, PhoneIcon } from '@constants/svgAssets';

import type { ClientFormComponentProps } from '../../../types/clients.types';
import { styles } from './styles';

export const ClientFormComponent = ({
  isEdit,
  submitting,
  clientTypes,
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  onCancel,
}: ClientFormComponentProps) => {
  const { t } = useTranslation();
  const phoneRef = React.useRef<React.ComponentRef<typeof AppInputField>>(null);
  const addressRef = React.useRef<React.ComponentRef<typeof AppInputField>>(null);
  const creditLimitRef = React.useRef<React.ComponentRef<typeof AppInputField>>(null);
  const openingBalanceRef = React.useRef<React.ComponentRef<typeof AppInputField>>(null);
  const notesRef = React.useRef<React.ComponentRef<typeof AppInputField>>(null);

  const err = (field: string) => (touched[field] ? errors[field] : undefined);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onCancel} activeOpacity={0.7}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              {isEdit ? t('clients.editTitle') : t('clients.newTitle')}
            </Text>
            <Text style={styles.headerSub}>
              {isEdit ? t('clients.formSubtitleEdit') : t('clients.formSubtitle')}
            </Text>
          </View>
        </View>

        <AppKeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
        >
          {/* Client type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('clients.typeLabel')}</Text>
            <View style={[styles.segmented, isEdit && styles.segDisabled]}>
              {clientTypes.map((opt) => {
                const active = values.clientTypeId === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.segBtn, active && styles.segBtnActive]}
                    onPress={() => !isEdit && setFieldValue('clientTypeId', opt.id)}
                    activeOpacity={isEdit ? 1 : 0.7}
                    disabled={isEdit}
                  >
                    <Text style={[styles.segText, active && styles.segTextActive]}>{opt.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionGap} />

          {/* Client info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('clients.infoSection')}</Text>
            <AppInputField
              label={t('clients.fieldName')}
              required
              value={values.name}
              onChangeText={(v) => setFieldValue('name', v)}
              onBlur={() => setFieldTouched('name', true)}
              placeholder={t('clients.fieldNamePlaceholder')}
              error={err('name')}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <AppInputField
              ref={phoneRef}
              label={t('clients.fieldPhone')}
              value={values.phone}
              onChangeText={(v) => setFieldValue('phone', v)}
              onBlur={() => setFieldTouched('phone', true)}
              placeholder={t('clients.fieldPhonePlaceholder')}
              error={err('phone')}
              leading={<PhoneIcon size={18} color={colors.textTertiary} />}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
            />
            <AppInputField
              ref={addressRef}
              label={t('clients.fieldAddress')}
              value={values.address}
              onChangeText={(v) => setFieldValue('address', v)}
              onBlur={() => setFieldTouched('address', true)}
              placeholder={t('clients.fieldAddressPlaceholder')}
              error={err('address')}
              returnKeyType="next"
              onSubmitEditing={() => creditLimitRef.current?.focus()}
            />
          </View>

          <View style={styles.sectionGap} />

          {/* Financial */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('clients.financialSection')}</Text>
            <AppInputField
              ref={creditLimitRef}
              label={t('clients.fieldCreditLimit')}
              value={values.creditLimit}
              onChangeText={(v) => setFieldValue('creditLimit', sanitizeDecimalInput(v))}
              onBlur={() => setFieldTouched('creditLimit', true)}
              placeholder="0"
              error={err('creditLimit')}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() =>
                isEdit ? notesRef.current?.focus() : openingBalanceRef.current?.focus()
              }
            />
            <AppInputField
              ref={openingBalanceRef}
              label={t('clients.fieldOpeningBalance')}
              value={values.openingBalance}
              onChangeText={(v) => setFieldValue('openingBalance', v)}
              onBlur={() => setFieldTouched('openingBalance', true)}
              placeholder="0"
              error={err('openingBalance')}
              helper={t('clients.openingBalanceHelper')}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => notesRef.current?.focus()}
              editable={!isEdit}
            />
          </View>

          <View style={styles.sectionGap} />

          {/* Notes */}
          <View style={styles.section}>
            <AppInputField
              ref={notesRef}
              label={t('clients.fieldNotes')}
              value={values.notes}
              onChangeText={(v) => setFieldValue('notes', v)}
              onBlur={() => setFieldTouched('notes', true)}
              placeholder={t('clients.fieldNotesPlaceholder')}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
        </AppKeyboardAwareScrollView>

        {/* Bottom bar */}
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
              {submitting ? t('common.saving') : t('clients.saveBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
