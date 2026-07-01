import React, { useMemo } from 'react';

import {
  ActivityIndicator,
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

import type { EditOrderComponentProps } from '../../../types/orders.types';
import { LineItemFormCard } from '../CreateOrderComponent/LineItemFormCard';
import { styles } from './styles';

const STEPS = ['orders.edit.stepDetails', 'orders.edit.stepLines', 'orders.edit.stepReview'];

export const EditOrderComponent = ({
  step,
  submitting,
  loading,
  clientName,
  values,
  paymentTypes,
  productItems,
  productPickerVisible,
  lineErrors,
  lineAvailability,
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
}: EditOrderComponentProps) => {
  const { t } = useTranslation();

  const lineLabels = useMemo(
    () => ({
      product: t('orders.edit.product'),
      qty: t('orders.edit.qty'),
      unitPrice: t('orders.edit.unitPrice'),
      addProduct: t('orders.edit.addProduct'),
      lineTotal: t('orders.edit.lineTotal'),
    }),
    [t],
  );

  const runningTotal = values.lines.reduce(
    (sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
    0,
  );

  const renderStep = () => {
    if (step === AppConstants.ORDER_WIZARD.STEP_CLIENT) {
      return (
        <View style={styles.stepContent}>
          <AppInputField
            label={t('orders.edit.customer')}
            value={clientName || '—'}
            onChangeText={() => {}}
            onBlur={() => {}}
            placeholder="—"
            helper={t('orders.edit.customerLocked')}
            editable={false}
          />

          <View style={styles.fieldGroup}>
            <FieldLabel label={t('orders.edit.paymentType')} required />
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

          <AppInputField
            label={t('orders.edit.notes')}
            value={values.notes}
            onChangeText={(v) => onFieldChange('notes', v)}
            onBlur={() => onFieldBlur('notes')}
            placeholder={t('orders.edit.notesPlaceholder')}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (step === AppConstants.ORDER_WIZARD.STEP_PRODUCTS) {
      return (
        <View style={styles.stepContent}>
          <TouchableOpacity style={styles.addLineBtn} onPress={onAddLine} activeOpacity={0.7}>
            <PlusIcon size={18} color={colors.primary} />
            <Text style={styles.addLineTxt}>{t('orders.edit.addProduct')}</Text>
          </TouchableOpacity>

          {values.lines.map((line, i) => (
            <LineItemFormCard
              key={i}
              line={line}
              index={i}
              qtyError={lineErrors[i]?.qty}
              availableLabel={lineAvailability[i]}
              labels={lineLabels}
              onRemove={onRemoveLine}
              onChange={onLineChange}
              onSelectProduct={onSelectProduct}
            />
          ))}

          {values.lines.length > 0 && (
            <View style={styles.runningTotalCard}>
              <Text style={styles.runningTotalLabel}>{t('orders.edit.runningTotal')}</Text>
              <Text style={styles.runningTotalValue}>{formatPKR(runningTotal)}</Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <View style={styles.reviewClientCard}>
          <View style={styles.reviewClientLeft}>
            <Text style={styles.reviewClientName}>{clientName || '—'}</Text>
            <Text style={styles.reviewClientSub}>
              {paymentTypes.find((p) => p.id === values.paymentTypeId)?.name ?? ''}
            </Text>
          </View>
        </View>

        <View style={styles.reviewLinesCard}>
          <View style={styles.reviewLinesHeader}>
            <Text style={styles.reviewLinesCount}>
              {t('orders.edit.lineItems', { count: values.lines.length })}
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
                  {`${l.qty} × ${formatPKR(parseFloat(l.unitPrice) || 0)}`}
                </Text>
              </View>
              <Text style={styles.reviewLineTotal}>
                {formatPKR((parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0))}
              </Text>
            </View>
          ))}
          <View style={styles.reviewTotalRow}>
            <Text style={styles.reviewTotalLabel}>{t('orders.edit.totalLabel')}</Text>
            <Text style={styles.reviewTotalValue}>{formatPKR(runningTotal)}</Text>
          </View>
        </View>

        {values.notes ? (
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('orders.edit.notes')} />
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
          <Text style={styles.headerTitle}>{t('orders.edit.title')}</Text>
          <Text style={styles.headerSub}>{t('orders.edit.subtitle')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stepIndicator}>
        <AppStepIndicator steps={STEPS.map((key) => t(key))} current={step} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
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
        visible={productPickerVisible}
        title={t('orders.edit.addProduct')}
        items={productItems}
        selectedId={productItems.find((p) => values.lines.some((l) => l.productId === p.id))?.id}
        onSelect={onProductPicked}
        onClose={onProductPickerClose}
        searchPlaceholder={t('orders.edit.addProduct')}
      />

      <AppBottomBar>
        <View style={styles.bottomBarRow}>
          {step > AppConstants.ORDER_WIZARD.STEP_CLIENT && (
            <View style={styles.flexBtn}>
              <AppButton
                label={t('orders.edit.back')}
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
                step === AppConstants.ORDER_WIZARD.STEP_REVIEW
                  ? t('orders.edit.saveChanges')
                  : t('orders.edit.continue')
              }
              onPress={step === AppConstants.ORDER_WIZARD.STEP_REVIEW ? onSubmit : onNext}
              variant={step === AppConstants.ORDER_WIZARD.STEP_REVIEW ? 'success' : 'primary'}
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
