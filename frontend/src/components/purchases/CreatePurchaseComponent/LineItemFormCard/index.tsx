import { useRef } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { AppInputField } from '@components/common/AppInputField';
import { FieldLabel } from '@components/common/FieldLabel';

import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';

import { colors } from '@theme/colors';

import { TrashIcon } from '@constants/svgAssets';

import type { PurchaseLineItemFormCardProps } from '../../../../types/purchases.types';
import { styles } from './styles';

export const LineItemFormCard = ({
  line,
  index,
  qtyError,
  onRemove,
  onChange,
  onSelectProduct,
}: PurchaseLineItemFormCardProps) => {
  const { t } = useTranslation();
  const unitCostRef = useRef<TextInput>(null);

  const qty = parseFloat(line.qty) || 0;
  const cost = parseFloat(line.unitCost) || 0;
  const lineTotal = qty * cost;

  return (
    <AppCard padding={14}>
      <View style={styles.cardInner}>
        <FieldLabel label={t('purchases.create.product')} required />
        <View style={styles.productRow}>
          <TouchableOpacity
            style={styles.productTile}
            onPress={() => onSelectProduct(index)}
            activeOpacity={0.7}
          >
            <View style={styles.productInfo}>
              {line.productName ? (
                <>
                  <Text style={styles.productName}>{line.productName}</Text>
                  <Text style={styles.productSku}>{line.sku}</Text>
                </>
              ) : (
                <Text style={styles.productPlaceholder}>{t('purchases.create.addProduct')}</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
            <TrashIcon size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfField}>
            <AppInputField
              label={t('purchases.create.qty')}
              required
              value={line.qty}
              onChangeText={(v) => onChange(index, 'qty', sanitizeDecimalInput(v))}
              onBlur={() => {}}
              placeholder="0"
              error={qtyError}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => unitCostRef.current?.focus()}
            />
          </View>
          <View style={styles.halfField}>
            <AppInputField
              ref={unitCostRef}
              label={t('purchases.create.unitCost')}
              required
              value={line.unitCost}
              onChangeText={(v) => onChange(index, 'unitCost', sanitizeDecimalInput(v))}
              onBlur={() => {}}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {lineTotal > 0 && (
          <View style={styles.lineTotalRow}>
            <Text style={styles.lineTotalLabel}>{t('purchases.create.lineTotal')}</Text>
            <AppAmount value={lineTotal} size={16} tone="debit" />
          </View>
        )}
      </View>
    </AppCard>
  );
};
