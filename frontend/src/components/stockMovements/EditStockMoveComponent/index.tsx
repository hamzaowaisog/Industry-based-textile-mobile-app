import { useRef } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppDatePicker } from '@components/common/AppDatePicker';
import { AppInputField } from '@components/common/AppInputField';
import { AppKeyboardAwareScrollView } from '@components/common/AppKeyboardAwareScrollView';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { FieldLabel } from '@components/common/FieldLabel';
import { StockMoveDetailSkeleton } from '@components/stockMovements/StockMoveDetailComponent/StockMoveDetailSkeleton';

import { formatAmountInput } from '@utils/helpers/formatCurrency';
import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';
import { MOVEMENT_SOURCE_ICONS } from '@utils/helpers/stockMovementsContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, BoxIcon } from '@constants/svgAssets';

import type { EditStockMoveComponentProps } from '../../../types/stockMovements.types';
import { styles } from './styles';

const { PURCHASE, SALE, MANUAL } = AppConstants.MOVEMENT_SOURCE;
const { IN, OUT } = AppConstants.MOVEMENT_TYPE;

export const EditStockMoveComponent = ({
  submitting,
  loading,
  movement,
  values,
  errors,
  touched,
  movementSources,
  movementTypes,
  productItems,
  selectedProductStock,
  productPickerVisible,
  onOpenProductPicker,
  onProductPicked,
  onProductPickerClose,
  onBack,
  onSubmit,
  onFieldChange,
  onFieldBlur,
}: EditStockMoveComponentProps) => {
  const { t } = useTranslation();
  const unitCostRef = useRef<TextInput>(null);
  const unitPriceRef = useRef<TextInput>(null);

  if (loading || !movement) {
    return <StockMoveDetailSkeleton />;
  }

  const isManual = values.movementSource === MANUAL;
  const showUnitCost =
    values.movementSource === PURCHASE || (isManual && values.movementType === IN);
  const showUnitPrice = values.movementSource === SALE || (isManual && values.movementType === OUT);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('stockMovements.edit.title')}</Text>
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
          <FieldLabel label={t('stockMovements.product')} required />
          <TouchableOpacity
            style={[
              styles.selectRow,
              errors.productId && touched.productId && styles.selectRowError,
            ]}
            onPress={onOpenProductPicker}
            activeOpacity={0.7}
          >
            <Text style={values.productName ? styles.selectValue : styles.selectPlaceholder}>
              {values.productName || t('stockMovements.productPlaceholder')}
            </Text>
          </TouchableOpacity>
          {selectedProductStock !== null ? (
            <Text style={styles.fieldHint}>
              {t('stockMovements.currentStock', {
                qty: formatAmountInput(String(selectedProductStock)),
              })}
            </Text>
          ) : null}
          {touched.productId && errors.productId ? (
            <Text style={styles.fieldError}>{errors.productId}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel label={t('stockMovements.source')} required />
          <View style={styles.sourceRow}>
            {movementSources.map((source) => {
              const active = values.movementSource === source.id;
              const SourceIcon = MOVEMENT_SOURCE_ICONS[source.id] ?? BoxIcon;
              return (
                <TouchableOpacity
                  key={source.id}
                  style={[styles.sourceBtn, active && styles.sourceBtnActive]}
                  onPress={() => onFieldChange('movementSource', source.id)}
                  activeOpacity={0.7}
                >
                  <SourceIcon size={18} color={active ? colors.primary : colors.text} />
                  <Text style={[styles.sourceTxt, active && styles.sourceTxtActive]}>
                    {source.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {touched.movementSource && errors.movementSource ? (
            <Text style={styles.fieldError}>{errors.movementSource}</Text>
          ) : null}
        </View>

        {isManual && (
          <View style={styles.fieldGroup}>
            <FieldLabel label={t('stockMovements.type')} required />
            <View style={styles.typeRow}>
              {movementTypes.map((type) => {
                const active = values.movementType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => onFieldChange('movementType', type.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {touched.movementType && errors.movementType ? (
              <Text style={styles.fieldError}>{errors.movementType}</Text>
            ) : null}
          </View>
        )}

        <AppInputField
          label={t('stockMovements.qty')}
          required
          value={values.qty}
          onChangeText={(v) => onFieldChange('qty', sanitizeDecimalInput(v))}
          onBlur={() => onFieldBlur('qty')}
          error={touched.qty ? errors.qty : undefined}
          keyboardType="decimal-pad"
          returnKeyType="next"
          onSubmitEditing={() => unitCostRef.current?.focus()}
          placeholder="0"
        />

        {showUnitCost ? (
          <AppInputField
            label={t('stockMovements.unitCost')}
            ref={unitCostRef}
            value={values.unitCost}
            onChangeText={(v) => onFieldChange('unitCost', sanitizeDecimalInput(v))}
            onBlur={() => onFieldBlur('unitCost')}
            error={touched.unitCost ? errors.unitCost : undefined}
            keyboardType="decimal-pad"
            returnKeyType={showUnitPrice ? 'next' : 'done'}
            onSubmitEditing={showUnitPrice ? () => unitPriceRef.current?.focus() : onSubmit}
            placeholder="0"
          />
        ) : null}

        {showUnitPrice ? (
          <AppInputField
            label={t('stockMovements.unitPrice')}
            ref={unitPriceRef}
            value={values.unitPrice}
            onChangeText={(v) => onFieldChange('unitPrice', sanitizeDecimalInput(v))}
            onBlur={() => onFieldBlur('unitPrice')}
            error={touched.unitPrice ? errors.unitPrice : undefined}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            placeholder="0"
          />
        ) : null}

        <AppDatePicker
          label={t('stockMovements.movementDate')}
          value={values.movementDate}
          onChange={(v) => onFieldChange('movementDate', v)}
          placeholder={t('stockMovements.edit.datePlaceholder')}
          helper={t('stockMovements.edit.dateHint')}
          maximumDate={new Date()}
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

      <AppSelectModal
        visible={productPickerVisible}
        title={t('stockMovements.selectProduct')}
        items={productItems}
        selectedId={values.productId ?? undefined}
        onSelect={onProductPicked}
        onClose={onProductPickerClose}
        searchPlaceholder={t('stockMovements.searchProductPlaceholder')}
      />
    </SafeAreaView>
  );
};
