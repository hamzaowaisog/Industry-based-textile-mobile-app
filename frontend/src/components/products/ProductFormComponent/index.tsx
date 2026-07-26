import React, { useRef } from 'react';

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInputField } from '@components/common/AppInputField';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { FieldLabel } from '@components/common/FieldLabel';

import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, ArrowRightIcon } from '@constants/svgAssets';

import type { ProductFormComponentProps } from '../../../types/products.types';
import { FieldError } from './FieldError';
import { styles } from './styles';

export const ProductFormComponent = ({
  isEdit,
  submitting,
  loading,
  values,
  errors,
  touched,
  unitPickerVisible,
  unitItems,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  onCancel,
  onOpenUnitPicker,
  onCloseUnitPicker,
}: ProductFormComponentProps) => {
  const { t } = useTranslation();

  const skuRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const defaultCostRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const defaultPriceRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const quantityRef = useRef<React.ComponentRef<typeof AppInputField>>(null);
  const reorderLevelRef = useRef<React.ComponentRef<typeof AppInputField>>(null);

  const err = (field: string) => (touched[field] ? errors[field] : undefined);

  const selectedUnitId = values.unitId || undefined;
  const selectedUnitName = unitItems.find((u) => u.id === values.unitId)?.name ?? '';

  const onUnitSelect = (id: number, _name: string) => {
    void setFieldValue('unitId', id);
    setFieldTouched('unitId', true);
    onCloseUnitPicker();
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
      <View style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={onCancel} activeOpacity={0.7}>
            <ArrowLeftIcon size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isEdit ? t('products.edit.title') : t('products.create.title')}
          </Text>
        </View>

        <AppKeyboardAwareScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={24}
        >
          <AppInputField
            label={t('products.fields.name')}
            required
            value={values.name}
            onChangeText={(v) => void setFieldValue('name', v)}
            onBlur={() => setFieldTouched('name', true)}
            placeholder={t('products.fields.namePlaceholder')}
            error={err('name')}
            returnKeyType="next"
            onSubmitEditing={() =>
              isEdit ? defaultCostRef.current?.focus() : skuRef.current?.focus()
            }
          />

          {!isEdit && (
            <AppInputField
              ref={skuRef}
              label={t('products.fields.sku')}
              required
              value={values.sku}
              onChangeText={(v) => void setFieldValue('sku', v.toUpperCase())}
              onBlur={() => setFieldTouched('sku', true)}
              placeholder={t('products.fields.skuPlaceholder')}
              error={err('sku')}
              autoCapitalize="characters"
              returnKeyType="next"
              onSubmitEditing={() => defaultCostRef.current?.focus()}
            />
          )}

          <View style={styles.fieldWrap}>
            <FieldLabel label={t('products.fields.unit')} required />
            <TouchableOpacity
              style={[styles.pickerRow, touched.unitId && errors.unitId ? styles.pickerError : null]}
              onPress={onOpenUnitPicker}
              activeOpacity={0.7}
            >
              <Text style={selectedUnitName ? styles.pickerValue : styles.pickerPlaceholder}>
                {selectedUnitName || t('products.fields.unitPlaceholder')}
              </Text>
              <ArrowRightIcon size={16} color={colors.textTertiary} />
            </TouchableOpacity>
            <FieldError msg={err('unitId')} />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <AppInputField
                ref={defaultCostRef}
                label={t('products.fields.defaultCost')}
                required
                value={values.defaultCost}
                onChangeText={(v) => void setFieldValue('defaultCost', sanitizeDecimalInput(v))}
                onBlur={() => setFieldTouched('defaultCost', true)}
                placeholder="0"
                error={err('defaultCost')}
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() => defaultPriceRef.current?.focus()}
              />
            </View>
            <View style={styles.halfField}>
              <AppInputField
                ref={defaultPriceRef}
                label={t('products.fields.defaultPrice')}
                required
                value={values.defaultPrice}
                onChangeText={(v) => void setFieldValue('defaultPrice', sanitizeDecimalInput(v))}
                onBlur={() => setFieldTouched('defaultPrice', true)}
                placeholder="0"
                error={err('defaultPrice')}
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() =>
                  isEdit ? reorderLevelRef.current?.focus() : quantityRef.current?.focus()
                }
              />
            </View>
          </View>

          {!isEdit && (
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <AppInputField
                  ref={quantityRef}
                  label={t('products.fields.quantity')}
                  value={values.quantity}
                  onChangeText={(v) => void setFieldValue('quantity', sanitizeDecimalInput(v))}
                  onBlur={() => setFieldTouched('quantity', true)}
                  placeholder="0"
                  error={err('quantity')}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => reorderLevelRef.current?.focus()}
                />
              </View>
              <View style={styles.halfField}>
                <AppInputField
                  ref={reorderLevelRef}
                  label={t('products.fields.reorderLevel')}
                  value={values.reorderLevel}
                  onChangeText={(v) => void setFieldValue('reorderLevel', sanitizeDecimalInput(v))}
                  onBlur={() => setFieldTouched('reorderLevel', true)}
                  placeholder="0"
                  error={err('reorderLevel')}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={() => handleSubmit()}
                />
              </View>
            </View>
          )}

          {isEdit && (
            <AppInputField
              ref={reorderLevelRef}
              label={t('products.fields.reorderLevel')}
              value={values.reorderLevel}
              onChangeText={(v) => void setFieldValue('reorderLevel', sanitizeDecimalInput(v))}
              onBlur={() => setFieldTouched('reorderLevel', true)}
              placeholder="0"
              error={err('reorderLevel')}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit()}
            />
          )}
        </AppKeyboardAwareScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={() => handleSubmit()}
            activeOpacity={0.8}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitText}>
                {isEdit ? t('products.edit.save') : t('products.create.submit')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <AppSelectModal
        visible={unitPickerVisible}
        title={t('products.fields.unitPickerTitle')}
        items={unitItems}
        selectedId={selectedUnitId}
        onSelect={onUnitSelect}
        onClose={onCloseUnitPicker}
        searchPlaceholder={t('products.fields.unitPickerSearch')}
      />
    </SafeAreaView>
  );
};
