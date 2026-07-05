import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppInputField } from '@components/common/AppInputField';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { FieldLabel } from '@components/common/FieldLabel';

import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, CoinsIcon, CreditCardIcon, WalletIcon } from '@constants/svgAssets';

import type { EditPaymentComponentProps } from '../../../types/payments.types';
import { EditPaymentSkeleton } from './EditPaymentSkeleton';
import { styles } from './styles';

const MODE_ICONS: Record<number, typeof WalletIcon> = {
  [AppConstants.TRANS_MODE.CASH]: WalletIcon,
  [AppConstants.TRANS_MODE.BANK]: CoinsIcon,
  [AppConstants.TRANS_MODE.CREDIT]: CreditCardIcon,
};

export const EditPaymentComponent = ({
  submitting,
  loading,
  payment,
  values,
  errors,
  touched,
  transModes,
  onBack,
  onSubmit,
  onFieldChange,
  onFieldBlur,
}: EditPaymentComponentProps) => {
  const { t } = useTranslation();

  if (loading || !payment) {
    return <EditPaymentSkeleton />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('payments.edit.title')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <AppKeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
          <AppInputField
            label={t('payments.amount')}
            value={formatPKR(payment.amount)}
            onChangeText={() => {}}
            onBlur={() => {}}
            editable={false}
            helper={t('payments.edit.immutableAmount')}
          />

          <AppInputField
            label={t('payments.client')}
            value={payment.partyClientName}
            onChangeText={() => {}}
            onBlur={() => {}}
            editable={false}
            helper={t('payments.edit.immutableClient')}
          />

          <AppInputField
            label={t('payments.direction')}
            value={payment.paymentDirectionName}
            onChangeText={() => {}}
            onBlur={() => {}}
            editable={false}
            helper={t('payments.edit.immutableDirection')}
          />

          <AppInputField
            label={t('payments.paymentDate')}
            value={values.paymentDate}
            onChangeText={(v) => onFieldChange('paymentDate', v)}
            onBlur={() => onFieldBlur('paymentDate')}
            placeholder={payment.paymentDate}
            helper={t('payments.edit.dateHint')}
          />

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
              variant="primary"
              label={t('common.save')}
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </AppBottomBar>
    </SafeAreaView>
  );
};
