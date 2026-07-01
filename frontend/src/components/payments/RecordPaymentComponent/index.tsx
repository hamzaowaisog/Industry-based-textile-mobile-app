import { useRef } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAvatar } from '@components/common/AppAvatar';
import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { AppInputField } from '@components/common/AppInputField';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { FieldLabel } from '@components/common/FieldLabel';

import { formatAmountInput } from '@utils/helpers/formatCurrency';
import { isPaymentReceived } from '@utils/helpers/paymentContent';
import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';
import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CoinsIcon,
  CreditCardIcon,
  WalletIcon,
} from '@constants/svgAssets';

import type { RecordPaymentComponentProps } from '../../../types/payments.types';
import { styles } from './styles';

const MODE_ICONS: Record<number, typeof WalletIcon> = {
  [AppConstants.TRANS_MODE.CASH]: WalletIcon,
  [AppConstants.TRANS_MODE.BANK]: CoinsIcon,
  [AppConstants.TRANS_MODE.CREDIT]: CreditCardIcon,
};

export const RecordPaymentComponent = ({
  submitting,
  isClientLocked,
  balanceHelper,
  overpayHelper,
  values,
  errors,
  touched,
  transModes,
  clientItems,
  clientPickerVisible,
  onBack,
  onSubmit,
  onFieldChange,
  onFieldBlur,
  onSelectClient,
  onClientPicked,
  onClientPickerClose,
}: RecordPaymentComponentProps) => {
  const { t } = useTranslation();
  const notesRef = useRef<TextInput>(null);
  const received = isPaymentReceived(values.paymentDirectionId);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('payments.recordPayment')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <AppKeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
          <View style={styles.directionRow}>
            {[
              {
                id: AppConstants.PAYMENT_DIRECTION.RECEIVED,
                label: t('payments.received'),
                color: colors.success,
                Icon: ArrowDownIcon,
              },
              {
                id: AppConstants.PAYMENT_DIRECTION.PAID,
                label: t('payments.paid'),
                color: colors.warning,
                Icon: ArrowUpIcon,
              },
            ].map((opt) => {
              const active = values.paymentDirectionId === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.directionBtn,
                    active && {
                      backgroundColor: `${opt.color}15`,
                      borderColor: opt.color,
                    },
                  ]}
                  onPress={() => onFieldChange('paymentDirectionId', opt.id)}
                  activeOpacity={0.7}
                  disabled={isClientLocked}
                >
                  <View
                    style={[
                      styles.directionIconWrap,
                      { backgroundColor: active ? opt.color : colors.bgAlt },
                    ]}
                  >
                    <opt.Icon size={18} color={active ? colors.white : colors.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.directionLabel,
                      { color: active ? opt.color : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>{t('payments.amount')}</Text>
            <View style={styles.amountWrap}>
              <Text style={styles.amountPrefix}>{AppConstants.CURRENCY.PREFIX}</Text>
              <TextInput
                style={styles.amountInput}
                value={formatAmountInput(values.amount)}
                onChangeText={(v) => onFieldChange('amount', sanitizeDecimalInput(v.replace(/,/g, '')))}
                onBlur={() => onFieldBlur('amount')}
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() => notesRef.current?.focus()}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            {touched.amount && errors.amount ? (
              <Text style={styles.fieldError}>{errors.amount}</Text>
            ) : overpayHelper ? (
              <Text style={styles.helperText}>{overpayHelper}</Text>
            ) : (
              <Text style={styles.helperText}>
                {received ? t('payments.amountHelperReceived') : t('payments.amountHelperPaid')}
              </Text>
            )}
          </View>

          {isClientLocked ? (
            <AppInputField
              label={t('payments.client')}
              required
              value={values.partyClientName}
              onChangeText={() => {}}
              onBlur={() => {}}
              editable={false}
              helper={balanceHelper ?? t('payments.clientLocked')}
            />
          ) : (
            <View style={styles.fieldGroup}>
              <FieldLabel label={t('payments.client')} required />
              <TouchableOpacity
                style={[
                  styles.selectRow,
                  errors.partyClientId && touched.partyClientId && styles.selectRowError,
                ]}
                onPress={onSelectClient}
                activeOpacity={0.7}
              >
                {values.partyClientName ? (
                  <AppAvatar
                    label={getInitials(values.partyClientName)}
                    color={colors.primary}
                    size={36}
                  />
                ) : null}
                <View style={styles.selectBody}>
                  <Text
                    style={
                      values.partyClientName ? styles.selectValue : styles.selectPlaceholder
                    }
                  >
                    {values.partyClientName || t('payments.clientPlaceholder')}
                  </Text>
                  {balanceHelper ? (
                    <Text style={styles.selectHelper}>{balanceHelper}</Text>
                  ) : null}
                </View>
                <ArrowRightIcon size={18} color={colors.textTertiary} />
              </TouchableOpacity>
              {touched.partyClientId && errors.partyClientId ? (
                <Text style={styles.fieldError}>{errors.partyClientId}</Text>
              ) : null}
            </View>
          )}

          <View style={styles.fieldGroup}>
            <FieldLabel label={t('payments.transMode')} required />
            <View style={styles.modeRow}>
              {transModes.map((mode) => {
                const active = values.transModeId === mode.id;
                const ModeIcon = MODE_ICONS[mode.id] ?? WalletIcon;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeBtn, active && styles.modeBtnActive]}
                    onPress={() => onFieldChange('transModeId', mode.id)}
                    activeOpacity={0.7}
                  >
                    <ModeIcon size={20} color={active ? colors.primary : colors.text} />
                    <Text style={[styles.modeTxt, active && styles.modeTxtActive]}>
                      {mode.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {touched.transModeId && errors.transModeId ? (
              <Text style={styles.fieldError}>{errors.transModeId}</Text>
            ) : null}
          </View>

          <AppInputField
            label={t('payments.notes')}
            ref={notesRef}
            value={values.notes}
            onChangeText={(v) => onFieldChange('notes', v)}
            onBlur={() => onFieldBlur('notes')}
            placeholder={t('payments.notesPlaceholder')}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </AppKeyboardAwareScrollView>

      <AppBottomBar>
        <View style={styles.bottomBarRow}>
          <View style={styles.flexBtn}>
            <AppButton
              variant="ghost"
              label={t('common.cancel')}
              onPress={onBack}
              size="lg"
              fullWidth
            />
          </View>
          <View style={styles.flexBtn}>
            <AppButton
              variant="success"
              label={t('payments.recordPayment')}
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </AppBottomBar>

      <AppSelectModal
        visible={clientPickerVisible}
        title={t('payments.client')}
        items={clientItems}
        selectedId={values.partyClientId ?? undefined}
        onSelect={onClientPicked}
        onClose={onClientPickerClose}
        searchPlaceholder={t('payments.clientPlaceholder')}
      />
    </SafeAreaView>
  );
};
