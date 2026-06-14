import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { AppInputField } from '@components/common/AppInputField';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import type { LineItemFormCardProps } from '@types/orders.types';

import { TrashIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const LineItemFormCard = ({
  line,
  index,
  qtyError,
  labels,
  onRemove,
  onChange,
  onSelectProduct,
}: LineItemFormCardProps) => {
  const qty = parseFloat(line.qty) || 0;
  const price = parseFloat(line.unitPrice) || 0;
  const lineTotal = qty * price;

  return (
    <View style={styles.card}>
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
              <Text style={styles.productPlaceholder}>{labels.addProduct}</Text>
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
            label={labels.qty}
            required
            value={line.qty}
            onChangeText={(v) => onChange(index, 'qty', v, line.productId)}
            onBlur={() => {}}
            placeholder="0"
            error={qtyError}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <AppInputField
            label={labels.unitPrice}
            required
            value={line.unitPrice}
            onChangeText={(v) => onChange(index, 'unitPrice', v)}
            onBlur={() => {}}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {lineTotal > 0 && (
        <View style={styles.lineTotalRow}>
          <Text style={styles.lineTotalLabel}>{labels.lineTotal}</Text>
          <Text style={styles.lineTotalValue}>{formatPKR(lineTotal)}</Text>
        </View>
      )}
    </View>
  );
};
