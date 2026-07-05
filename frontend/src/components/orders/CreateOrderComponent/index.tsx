import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

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

import type { CreateOrderComponentProps } from '../../../types/orders.types';
import { LineItemFormCard } from './LineItemFormCard';
import { styles } from './styles';

const STEPS = ['orders.create.stepDetails', 'orders.create.stepLines', 'orders.create.stepReview'];

export const CreateOrderComponent = ({
  step,
  isClientLocked,
  submitting,
  values,
  errors,
  touched,
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
  onSelectClient,
  onClientPicked,
  onClientPickerClose,
  onSelectProduct,
  onProductPicked,
  onProductPickerClose,
  paymentTypes,
  clientItems,
  clientPickerVisible,
  productItems,
  productPickerVisible,
}: CreateOrderComponentProps) => {
  const { t } = useTranslation();

  const runningTotal = values.lines.reduce((sum, l) => {
    return sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0);
  }, 0);

  const renderStep = () => {
    if (step === AppConstants.ORDER_WIZARD.STEP_CLIENT) {
      return (
        <View style={styles.stepContent}>
          {/* Customer selector */}
          {isClientLocked ? (
            <AppInputField
              label={t('orders.create.customer')}
              required
              value={values.clientName}
              onChangeText={() => {}}
              onBlur={() => {}}
              placeholder={t('orders.create.customerPlaceholder')}
              helper={t('orders.create.customerLocked')}
              editable={false}
            />
          ) : (
            <View style={styles.fieldGroup}>
              <FieldLabel label={t('orders.create.customer')} required />
              <TouchableOpacity
                style={[
                  styles.selectRow,
                  errors.clientId && touched.clientId && styles.selectRowError,
                ]}
                onPress={onSelectClient}
                activeOpacity={0.7}
              >
                <Text style={values.clientName ? styles.selectValue : styles.selectPlaceholder}>
                  {values.clientName || t('orders.create.customerPlaceholder')}
                </Text>
              </TouchableOpacity>
              {touched.clientId && errors.clientId ? (
                <Text style={styles.fieldError}>{errors.clientId}</Text>
              ) : null}
            </View>
          )}

          {/* Payment type */}
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('orders.create.paymentType')} required />
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

          {/* Notes */}
          <AppInputField
            label={t('orders.create.notes')}
            value={values.notes}
            onChangeText={(v) => onFieldChange('notes', v)}
            onBlur={() => onFieldBlur('notes')}
            placeholder={t('orders.create.notesPlaceholder')}
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
            <Text style={styles.addLineTxt}>{t('orders.create.addProduct')}</Text>
          </TouchableOpacity>

          {values.lines.map((line, i) => (
            <LineItemFormCard
              key={i}
              line={line}
              index={i}
              qtyError={lineErrors[i]?.qty}
              availableLabel={lineAvailability[i]}
              labels={{
                product: t('orders.create.product'),
                qty: t('orders.create.qty'),
                unitPrice: t('orders.create.unitPrice'),
                addProduct: t('orders.create.addProduct'),
                lineTotal: t('orders.create.lineTotal'),
              }}
              onRemove={onRemoveLine}
              onChange={onLineChange}
              onSelectProduct={onSelectProduct}
            />
          ))}

          {values.lines.length > 0 && (
            <View style={styles.runningTotalCard}>
              <Text style={styles.runningTotalLabel}>{t('orders.create.runningTotal')}</Text>
              <Text style={styles.runningTotalValue}>{formatPKR(runningTotal)}</Text>
            </View>
          )}
        </View>
      );
    }

    // Step 2 — Review
    return (
      <View style={styles.stepContent}>
        <View style={styles.reviewClientCard}>
          <View style={styles.reviewClientLeft}>
            <Text style={styles.reviewClientName}>{values.clientName || '—'}</Text>
            <Text style={styles.reviewClientSub}>
              {paymentTypes.find((p) => p.id === values.paymentTypeId)?.name ?? ''}
            </Text>
          </View>
        </View>

        <View style={styles.reviewLinesCard}>
          <View style={styles.reviewLinesHeader}>
            <Text style={styles.reviewLinesCount}>
              {t('orders.create.lineItems', { count: values.lines.length })}
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
            <Text style={styles.reviewTotalLabel}>{t('orders.create.totalLabel')}</Text>
            <Text style={styles.reviewTotalValue}>{formatPKR(runningTotal)}</Text>
          </View>
        </View>

        {values.notes ? (
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('orders.create.notes')} />
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('orders.create.title')}</Text>
          <Text style={styles.headerSub}>{t('orders.create.subtitle')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <AppStepIndicator steps={STEPS.map((key) => t(key as any))} current={step} />
      </View>

      <AppKeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {renderStep()}
      </AppKeyboardAwareScrollView>

      <AppSelectModal
        visible={clientPickerVisible}
        title={t('orders.create.customer')}
        items={clientItems}
        selectedId={values.clientId ?? undefined}
        onSelect={onClientPicked}
        onClose={onClientPickerClose}
        searchPlaceholder={t('orders.create.customerPlaceholder')}
      />

      <AppSelectModal
        visible={productPickerVisible}
        title={t('orders.create.addProduct')}
        items={productItems}
        selectedId={productItems.find((p) => values.lines.some((l) => l.productId === p.id))?.id}
        onSelect={onProductPicked}
        onClose={onProductPickerClose}
        searchPlaceholder={t('orders.create.addProduct')}
      />

      {/* Bottom bar */}
      <AppBottomBar>
        <View style={styles.bottomBarRow}>
          {step > AppConstants.ORDER_WIZARD.STEP_CLIENT && (
            <View style={styles.flexBtn}>
              <AppButton
                label={t('orders.create.back')}
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
                  ? t('orders.create.placeOrder')
                  : t('orders.create.continue')
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
