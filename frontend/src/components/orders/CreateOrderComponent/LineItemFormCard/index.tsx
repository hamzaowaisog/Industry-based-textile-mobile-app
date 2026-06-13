import React from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { TrashIcon } from '@constants/svgAssets';

import type { LineItemFormCardProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const LineItemFormCard = ({
  line,
  index,
  qtyError,
  onRemove,
  onChange,
  onSelectProduct,
}: LineItemFormCardProps) => {
  const { t } = useTranslation();
  const qty = parseFloat(line.qty) || 0;
  const price = parseFloat(line.unitPrice) || 0;
  const lineTotal = qty * price;

  return (
    <View style={styles.card}>
      {/* Product row */}
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
              <Text style={styles.productPlaceholder}>{t('orders.create.addProduct')}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
          <TrashIcon size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Qty + price */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>{t('orders.create.qty')}</Text>
          <TextInput
            style={[styles.input, !!qtyError && styles.inputError]}
            value={line.qty}
            onChangeText={(v) => onChange(index, 'qty', v, line.productId)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
          />
          {qtyError ? <Text style={styles.fieldError}>{qtyError}</Text> : null}
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>{t('orders.create.unitPrice')}</Text>
          <TextInput
            style={styles.input}
            value={line.unitPrice}
            onChangeText={(v) => onChange(index, 'unitPrice', v)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      {/* Line total */}
      {lineTotal > 0 && (
        <View style={styles.lineTotalRow}>
          <Text style={styles.lineTotalLabel}>{t('orders.create.lineTotal')}</Text>
          <Text style={styles.lineTotalValue}>{formatPKR(lineTotal)}</Text>
        </View>
      )}
    </View>
  );
};
