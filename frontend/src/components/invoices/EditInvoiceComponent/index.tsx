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

import { ArrowLeftIcon, PlusIcon } from '@constants/svgAssets';

import type { EditInvoiceComponentProps } from '../../../types/invoices.types';
import { InvoiceLineFormCard } from '../CreateInvoiceComponent/InvoiceLineFormCard';
import { EditInvoiceSkeleton } from './EditInvoiceSkeleton';
import { styles } from './styles';

export const EditInvoiceComponent = ({
  submitting,
  loading,
  invoice,
  values,
  errors,
  touched,
  statusItems,
  totalAmount,
  onBack,
  onSubmit,
  onFieldChange,
  onFieldBlur,
  onAddLine,
  onRemoveLine,
  onLineChange,
}: EditInvoiceComponentProps) => {
  const { t } = useTranslation();

  if (loading || !invoice) {
    return <EditInvoiceSkeleton />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('invoices.edit.title')}</Text>
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
          label={t('invoices.detail.reference', { id: invoice.invoiceNumber })}
          value={invoice.invoiceNumber}
          onChangeText={() => {}}
          onBlur={() => {}}
          editable={false}
        />

        <AppInputField
          label={t('invoices.create.client')}
          value={invoice.clientName}
          onChangeText={() => {}}
          onBlur={() => {}}
          editable={false}
        />

        <View style={styles.fieldGroup}>
          <FieldLabel label={t('invoices.edit.status')} />
          <View style={styles.statusGrid}>
            {statusItems.map((s) => {
              const active = values.invoiceStatusId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.statusBtn, active && styles.statusBtnActive]}
                  onPress={() => onFieldChange('invoiceStatusId', s.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statusTxt, active && styles.statusTxtActive]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
