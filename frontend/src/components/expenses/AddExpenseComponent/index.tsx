import { useRef } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppDatePicker } from '@components/common/AppDatePicker';
import { AppInputField } from '@components/common/AppInputField';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { FieldLabel } from '@components/common/FieldLabel';

import { formatAmountInput } from '@utils/helpers/formatCurrency';
import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  ArrowLeftIcon,
  CoinsIcon,
  CreditCardIcon,
  WalletIcon,
} from '@constants/svgAssets';

import type { AddExpenseComponentProps } from '../../../types/expenses.types';
import { styles } from './styles';

const MODE_ICONS: Record<number, typeof WalletIcon> = {
  [AppConstants.TRANS_MODE.CASH]: WalletIcon,
  [AppConstants.TRANS_MODE.BANK]: CoinsIcon,
  [AppConstants.TRANS_MODE.CREDIT]: CreditCardIcon,
};

export const AddExpenseComponent = ({
  submitting,
  values,
  errors,
  touched,
  expenseTypes,
  transModes,
  onBack,
  onSubmit,
  onFieldChange,
  onFieldBlur,
}: AddExpenseComponentProps) => {
  const { t } = useTranslation();
  const notesRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('expenses.add.title')}</Text>
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
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t('expenses.amount')}</Text>
          <View style={styles.amountWrap}>
            <Text style={styles.amountPrefix}>{AppConstants.CURRENCY.PREFIX}</Text>
            <TextInput
              style={styles.amountInput}
              value={formatAmountInput(values.amount)}
              onChangeText={(v) =>
                onFieldChange('amount', sanitizeDecimalInput(v.replace(/,/g, '')))
              }
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
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label={t('expenses.category')} required />
          <View style={styles.chipsWrap}>
            {expenseTypes.map((type) => {
              const active = values.expenseTypeId === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => onFieldChange('expenseTypeId', type.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {touched.expenseTypeId && errors.expenseTypeId ? (
            <Text style={styles.fieldError}>{errors.expenseTypeId}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label={t('expenses.mode')} required />
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
                  <Text style={[styles.modeTxt, active && styles.modeTxtActive]}>{mode.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {touched.transModeId && errors.transModeId ? (
            <Text style={styles.fieldError}>{errors.transModeId}</Text>
          ) : null}
        </View>

        <AppDatePicker
          label={t('expenses.expenseDate')}
          value={values.expenseDate}
          onChange={(v) => onFieldChange('expenseDate', v)}
          placeholder={t('expenses.add.datePlaceholder')}
          helper={t('expenses.add.dateHint')}
          maximumDate={new Date()}
        />

        <AppInputField
          label={t('expenses.notes')}
          ref={notesRef}
          value={values.notes}
          onChangeText={(v) => onFieldChange('notes', v)}
          onBlur={() => onFieldBlur('notes')}
          placeholder={t('expenses.notesPlaceholder')}
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
              label={t('expenses.addExpense')}
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
