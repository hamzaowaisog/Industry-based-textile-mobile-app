import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAvatar } from '@components/common/AppAvatar';
import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppInputField } from '@components/common/AppInputField';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { FieldLabel } from '@components/common/FieldLabel';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from '@constants/svgAssets';

import type { CreateInvoiceComponentProps } from '../../../types/invoices.types';
import { InvoiceLineFormCard } from './InvoiceLineFormCard';
import { styles } from './styles';

export const CreateInvoiceComponent = ({
  submitting,
  values,
  errors,
  touched,
  clientItems,
  clientPickerVisible,
  totalAmount,
  onBack,
  onSubmit,
  onFieldChange,
  onFieldBlur,
  onSelectClient,
  onClientPicked,
  onClientPickerClose,
  onAddLine,
  onRemoveLine,
  onLineChange,
}: CreateInvoiceComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('invoices.create.title')}</Text>
          <Text style={styles.headerSub}>{t('invoices.create.subtitle')}</Text>
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
        <View style={styles.fieldGroup}>
          <FieldLabel label={t('invoices.create.client')} required />
          <TouchableOpacity
            style={[
              styles.selectRow,
              errors.clientId && touched.clientId && styles.selectRowError,
            ]}
            onPress={onSelectClient}
            activeOpacity={0.7}
          >
            {values.clientName ? (
              <AppAvatar label={getInitials(values.clientName)} color={colors.primary} size={36} />
            ) : null}
            <View style={styles.selectBody}>
              <Text
                style={values.clientName ? styles.selectValue : styles.selectPlaceholder}
              >
                {values.clientName || t('invoices.create.clientPlaceholder')}
              </Text>
            </View>
            <ArrowRightIcon size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          {touched.clientId && errors.clientId ? (
            <Text style={styles.fieldError}>{errors.clientId}</Text>
          ) : null}
        </View>

        <AppInputField
          label={t('invoices.create.dueDate')}
          value={values.dueDate}
          onChangeText={(v) => onFieldChange('dueDate', v)}
          onBlur={() => onFieldBlur('dueDate')}
          helper={t('invoices.create.dueDateHint')}
        />

        <View style={styles.linesSection}>
          <View style={styles.linesHeader}>
            <FieldLabel label={t('invoices.create.lineItems')} />
            <Text style={styles.linesCount}>
              {t('invoices.create.lineItemsCount', { count: values.lines.length })}
            </Text>
          </View>

          <TouchableOpacity style={styles.addLineBtn} onPress={onAddLine} activeOpacity={0.7}>
            <PlusIcon size={18} color={colors.primary} />
            <Text style={styles.addLineTxt}>{t('invoices.create.addLine')}</Text>
          </TouchableOpacity>

          {values.lines.map((line, i) => (
            <InvoiceLineFormCard
              key={i}
              line={line}
              index={i}
              labels={{
                product: t('invoices.create.product'),
                productPlaceholder: t('invoices.create.productPlaceholder'),
                qty: t('invoices.create.qty'),
                unitPrice: t('invoices.create.unitPrice'),
                lineTotal: t('invoices.create.lineTotal'),
              }}
              onRemove={onRemoveLine}
              onChange={onLineChange}
            />
          ))}

          {errors.lines ? <Text style={styles.fieldError}>{errors.lines}</Text> : null}

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('invoices.create.total')}</Text>
            <Text style={styles.totalValue}>{formatPKR(totalAmount)}</Text>
          </View>
        </View>

        <AppInputField
          label={t('invoices.create.notes')}
          value={values.notes}
          onChangeText={(v) => onFieldChange('notes', v)}
          onBlur={() => onFieldBlur('notes')}
          placeholder={t('invoices.create.notesPlaceholder')}
          multiline
          numberOfLines={3}
          returnKeyType="done"
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
              label={t('invoices.createInvoice')}
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
        title={t('invoices.create.client')}
        items={clientItems}
        selectedId={values.clientId ?? undefined}
        onSelect={onClientPicked}
        onClose={onClientPickerClose}
        searchPlaceholder={t('invoices.create.clientPlaceholder')}
      />
    </SafeAreaView>
  );
};
