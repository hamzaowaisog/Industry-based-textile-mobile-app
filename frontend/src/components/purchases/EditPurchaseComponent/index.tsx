import React, { useMemo } from 'react';

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppInputField } from '@components/common/AppInputField';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { AppStepIndicator } from '@components/common/AppStepIndicator';
import { FieldLabel } from '@components/common/FieldLabel';

import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, PlusIcon } from '@constants/svgAssets';

import type { EditPurchaseComponentProps } from '../../../types/purchases.types';
import { LineItemFormCard } from '../CreatePurchaseComponent/LineItemFormCard';
import { styles } from './styles';

const STEPS = [
  'purchases.edit.stepDetails',
  'purchases.edit.stepLines',
  'purchases.edit.stepReview',
];

export const EditPurchaseComponent = ({
  step,
  submitting,
  loading,
  supplierName,
  values,
  paymentTypes,
  productItems,
  productPickerVisible,
  lineErrors,
  onBack,
  onNext,
  onSubmit,
  onFieldChange,
  onFieldBlur,
  onAddLine,
  onRemoveLine,
  onLineChange,
  onSelectProduct,
  onProductPicked,
  onProductPickerClose,
}: EditPurchaseComponentProps) => {
  const { t } = useTranslation();

  const runningTotal = useMemo(
    () =>
      values.lines.reduce(
        (sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitCost) || 0),
        0,
      ),
    [values.lines],
  );

  const renderStep = () => {
    if (step === AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER) {
      return (
        <View style={styles.stepContent}>
          {/* Supplier — locked, cannot change */}
          <AppInputField
            label={t('purchases.edit.supplier')}
            value={supplierName || '—'}
            onChangeText={() => {}}
            onBlur={() => {}}
            placeholder="—"
            helper={t('purchases.edit.supplierLocked')}
            editable={false}
          />

          {/* Payment type */}
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('purchases.edit.paymentType')} required />
            <View style={styles.paymentTypeRow}>
              {paymentTypes.map((pt) => {
                const isActive = values.paymentTypeId === pt.id;
                return (
                  <TouchableOpacity
                    key={pt.id}
                    style={[styles.paymentTypeBtn, isActive && styles.paymentTypeBtnActive]}
                    onPress={() => onFieldChange('paymentTypeId', pt.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.paymentTypeTxt, isActive && styles.paymentTypeTxtActive]}>
                      {pt.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Purchase date — omitted: server keeps the original date on edit. */}

          {/* Notes */}
          <AppInputField
            label={t('purchases.edit.notes')}
            value={values.notes}
            onChangeText={(v) => onFieldChange('notes', v)}
            onBlur={() => onFieldBlur('notes')}
            placeholder={t('purchases.edit.notesPlaceholder')}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (step === AppConstants.PURCHASE_WIZARD.STEP_PRODUCTS) {
      return (
        <View style={styles.stepContent}>
          <TouchableOpacity style={styles.addLineBtn} onPress={onAddLine} activeOpacity={0.7}>
            <PlusIcon size={18} color={colors.primary} />
            <Text style={styles.addLineTxt}>{t('purchases.edit.addProduct')}</Text>
          </TouchableOpacity>

          {values.lines.map((line, i) => (
            <LineItemFormCard
              key={i}
              line={line}
              index={i}
              qtyError={lineErrors[i]?.qty}
              onRemove={onRemoveLine}
              onChange={onLineChange}
              onSelectProduct={onSelectProduct}
            />
          ))}

          {values.lines.length > 0 && (
            <View style={styles.runningTotalCard}>
              <Text style={styles.runningTotalLabel}>{t('purchases.edit.runningTotal')}</Text>
              <Text style={styles.runningTotalValue}>{formatPKR(runningTotal)}</Text>
            </View>
          )}
        </View>
      );
    }

    // Step 2 — Review
    return (
      <View style={styles.stepContent}>
        <View style={styles.reviewSupplierCard}>
          <Text style={styles.reviewSupplierName}>{supplierName || '—'}</Text>
          <Text style={styles.reviewSupplierSub}>
            {paymentTypes.find((p) => p.id === values.paymentTypeId)?.name ?? ''}
          </Text>
        </View>

        <View style={styles.reviewLinesCard}>
          <View style={styles.reviewLinesHeader}>
            <Text style={styles.reviewLinesCount}>
              {t('purchases.edit.lineItems', { count: values.lines.length })}
            </Text>
          </View>
          {values.lines.map((l, i) => (
            <View
              key={i}
              style={[
                styles.reviewLineRow,
                i < values.lines.length - 1 && styles.reviewLineRowBorder,
              ]}
            >
              <View>
                <Text style={styles.reviewLineName}>
                  {l.productName || `Product #${l.productId}`}
                </Text>
                <Text style={styles.reviewLineSub}>
                  {`${l.qty} × ${formatPKR(parseFloat(l.unitCost) || 0)}`}
                </Text>
              </View>
              <Text style={styles.reviewLineTotal}>
                {formatPKR((parseFloat(l.qty) || 0) * (parseFloat(l.unitCost) || 0))}
              </Text>
            </View>
          ))}
          <View style={styles.reviewTotalRow}>
            <Text style={styles.reviewTotalLabel}>{t('purchases.edit.totalLabel')}</Text>
            <Text style={styles.reviewTotalValue}>{formatPKR(runningTotal)}</Text>
          </View>
        </View>

        {values.notes ? (
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('purchases.edit.notes')} />
            <View style={styles.reviewNotesCard}>
              <Text style={styles.reviewNotesText}>{values.notes}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('purchases.edit.title')}</Text>
          <Text style={styles.headerSub}>{t('purchases.edit.subtitle')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stepIndicator}>
        <AppStepIndicator steps={STEPS.map((key) => t(key as any))} current={step} />
      </View>

      <AppKeyboardAwareScrollView
        style={[styles.flex, styles.scroll]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {renderStep()}
      </AppKeyboardAwareScrollView>

      <AppSelectModal
        visible={productPickerVisible}
        title={t('purchases.edit.addProduct')}
        items={productItems}
        selectedId={productItems.find((p) => values.lines.some((l) => l.productId === p.id))?.id}
        onSelect={onProductPicked}
        onClose={onProductPickerClose}
        searchPlaceholder={t('purchases.edit.addProduct')}
      />

      <AppBottomBar>
        <View style={styles.bottomBarRow}>
          {step > AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER && (
            <View style={styles.flexBtn}>
              <AppButton
                label={t('purchases.edit.back')}
                onPress={onBack}
                variant="ghost"
                size="lg"
                fullWidth
              />
            </View>
          )}
          <View style={styles.flexBtn}>
            <AppButton
              label={
                step === AppConstants.PURCHASE_WIZARD.STEP_REVIEW
                  ? t('purchases.edit.saveChanges')
                  : t('purchases.edit.continue')
              }
              onPress={step === AppConstants.PURCHASE_WIZARD.STEP_REVIEW ? onSubmit : onNext}
              variant={step === AppConstants.PURCHASE_WIZARD.STEP_REVIEW ? 'success' : 'primary'}
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting}
            />
          </View>
        </View>
      </AppBottomBar>
    </SafeAreaView>
  );
};
