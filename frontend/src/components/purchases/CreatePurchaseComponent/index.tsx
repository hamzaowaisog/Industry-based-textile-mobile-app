import React from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
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

import type { CreatePurchaseComponentProps } from '../../../types/purchases.types';
import { LineItemFormCard } from './LineItemFormCard';
import { styles } from './styles';

const STEPS = [
  'purchases.create.stepDetails',
  'purchases.create.stepLines',
  'purchases.create.stepReview',
];

export const CreatePurchaseComponent = ({
  step,
  isSupplierLocked,
  submitting,
  values,
  errors,
  touched,
  lineErrors,
  onBack,
  onNext,
  onSubmit,
  onFieldChange,
  onFieldBlur,
  onAddLine,
  onRemoveLine,
  onLineChange,
  onSelectSupplier,
  onSupplierPicked,
  onSupplierPickerClose,
  onSelectProduct,
  onProductPicked,
  onProductPickerClose,
  paymentTypes,
  supplierItems,
  supplierPickerVisible,
  productItems,
  productPickerVisible,
  runningTotal,
}: CreatePurchaseComponentProps) => {
  const { t } = useTranslation();

  const renderStep = () => {
    if (step === AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER) {
      return (
        <View style={styles.stepContent}>
          {/* Supplier selector */}
          {isSupplierLocked ? (
            <AppInputField
              label={t('purchases.create.supplier')}
              required
              value={values.supplierName}
              onChangeText={() => {}}
              onBlur={() => {}}
              placeholder={t('purchases.create.supplierPlaceholder')}
              helper={t('purchases.create.supplierLocked')}
              editable={false}
            />
          ) : (
            <View style={styles.fieldGroup}>
              <FieldLabel label={t('purchases.create.supplier')} required />
              <TouchableOpacity
                style={[
                  styles.selectRow,
                  errors.supplierId && touched.supplierId && styles.selectRowError,
                ]}
                onPress={onSelectSupplier}
                activeOpacity={0.7}
              >
                <Text style={values.supplierName ? styles.selectValue : styles.selectPlaceholder}>
                  {values.supplierName || t('purchases.create.supplierPlaceholder')}
                </Text>
              </TouchableOpacity>
              {touched.supplierId && errors.supplierId ? (
                <Text style={styles.fieldError}>{errors.supplierId}</Text>
              ) : null}
            </View>
          )}

          {/* Payment type */}
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('purchases.create.paymentType')} required />
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

          {/* Purchase date — omitted: server defaults to the current UTC date on create. */}

          {/* Notes */}
          <AppInputField
            label={t('purchases.create.notes')}
            value={values.notes}
            onChangeText={(v) => onFieldChange('notes', v)}
            onBlur={() => onFieldBlur('notes')}
            placeholder={t('purchases.create.notesPlaceholder')}
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
            <Text style={styles.addLineTxt}>{t('purchases.create.addProduct')}</Text>
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
              <Text style={styles.runningTotalLabel}>{t('purchases.create.runningTotal')}</Text>
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
          <View style={styles.reviewSupplierLeft}>
            <Text style={styles.reviewSupplierName}>{values.supplierName || '—'}</Text>
            <Text style={styles.reviewSupplierSub}>
              {paymentTypes.find((p) => p.id === values.paymentTypeId)?.name ?? ''}
            </Text>
          </View>
        </View>

        <View style={styles.reviewLinesCard}>
          <View style={styles.reviewLinesHeader}>
            <Text style={styles.reviewLinesCount}>
              {t('purchases.create.lineItems', { count: values.lines.length })}
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
            <Text style={styles.reviewTotalLabel}>{t('purchases.create.totalLabel')}</Text>
            <Text style={styles.reviewTotalValue}>{formatPKR(runningTotal)}</Text>
          </View>
        </View>

        {values.notes ? (
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('purchases.create.notes')} />
            <View style={styles.reviewNotesCard}>
              <Text style={styles.reviewNotesText}>{values.notes}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('purchases.create.title')}</Text>
          <Text style={styles.headerSub}>{t('purchases.create.subtitle')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stepIndicator}>
        <AppStepIndicator steps={STEPS.map((key) => t(key as any))} current={step} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === AppConstants.PLATFORM.OS.IOS ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <AppSelectModal
        visible={supplierPickerVisible}
        title={t('purchases.create.supplier')}
        items={supplierItems}
        selectedId={values.supplierId ?? undefined}
        onSelect={onSupplierPicked}
        onClose={onSupplierPickerClose}
        searchPlaceholder={t('purchases.create.supplierPlaceholder')}
      />

      <AppSelectModal
        visible={productPickerVisible}
        title={t('purchases.create.addProduct')}
        items={productItems}
        selectedId={productItems.find((p) => values.lines.some((l) => l.productId === p.id))?.id}
        onSelect={onProductPicked}
        onClose={onProductPickerClose}
        searchPlaceholder={t('purchases.create.addProduct')}
      />

      <AppBottomBar>
        <View style={styles.bottomBarRow}>
          {step > AppConstants.PURCHASE_WIZARD.STEP_SUPPLIER && (
            <View style={styles.flexBtn}>
              <AppButton
                label={t('purchases.create.back')}
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
                  ? t('purchases.create.placePurchase')
                  : t('purchases.create.continue')
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
