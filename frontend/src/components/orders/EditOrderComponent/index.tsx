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

import { AppInputField } from '@components/common/AppInputField';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { FieldLabel } from '@components/common/FieldLabel';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import type { EditOrderComponentProps } from '@types/orders.types';

import { ArrowLeftIcon, PlusIcon } from '@constants/svgAssets';

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
    if (step === 0) {
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

    if (step === 1) {
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
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
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
        {STEPS.map((key, i) => {
          const isDone = i < step;
          const isActive = i === step;
          return (
            <React.Fragment key={key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    isActive && styles.stepDotActive,
                    isDone && styles.stepDotDone,
                  ]}
                >
                  <Text
                    style={[styles.stepDotText, (isActive || isDone) && styles.stepDotTextActive]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{t(key)}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

      <View style={styles.bottomBar}>
        {step > 0 && (
          <TouchableOpacity style={styles.ghostBtn} onPress={onBack} activeOpacity={0.75}>
            <Text style={styles.ghostBtnText}>{t('orders.edit.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            step === 2 && styles.successBtn,
            submitting && styles.btnDisabled,
          ]}
          onPress={step === 2 ? onSubmit : onNext}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {step === 2 ? t('orders.edit.saveChanges') : t('orders.edit.continue')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
