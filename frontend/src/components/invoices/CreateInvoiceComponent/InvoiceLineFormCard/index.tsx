import { useRef } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { AppInputField } from '@components/common/AppInputField';

import { sanitizeDecimalInput } from '@utils/helpers/sanitizeInput';

import { colors } from '@theme/colors';

import { TrashIcon } from '@constants/svgAssets';

import type { InvoiceLineFormCardProps } from '../../../../types/invoices.types';
import { styles } from './styles';

export const InvoiceLineFormCard = ({
  line,
  index,
  labels,
  onRemove,
  onChange,
}: InvoiceLineFormCardProps) => {
  const qtyRef = useRef<TextInput>(null);
  const unitPriceRef = useRef<TextInput>(null);

  const qty = parseFloat(line.qty) || 0;
  const price = parseFloat(line.unitPrice) || 0;
  const lineTotal = qty * price;

  return (
    <AppCard padding={14}>
      <View style={styles.cardInner}>
        <View style={styles.headerRow}>
          <Text style={styles.lineIndex}>{`#${index + 1}`}</Text>
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
            <TrashIcon size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <AppInputField
          label={labels.product}
          required
          value={line.productName}
          onChangeText={(v) => onChange(index, 'productName', v)}
          onBlur={() => {}}
          placeholder={labels.productPlaceholder}
          returnKeyType="next"
          onSubmitEditing={() => qtyRef.current?.focus()}
        />

        <View style={styles.inputRow}>
          <View style={styles.halfField}>
            <AppInputField
              ref={qtyRef}
              label={labels.qty}
              required
              value={line.qty}
              onChangeText={(v) => onChange(index, 'qty', sanitizeDecimalInput(v))}
              onBlur={() => {}}
              placeholder="0"
              keyboardType="decimal-pad"
              returnKeyType="next"
              onSubmitEditing={() => unitPriceRef.current?.focus()}
            />
          </View>
          <View style={styles.halfField}>
            <AppInputField
              ref={unitPriceRef}
              label={labels.unitPrice}
              required
              value={line.unitPrice}
              onChangeText={(v) => onChange(index, 'unitPrice', sanitizeDecimalInput(v))}
              onBlur={() => {}}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {lineTotal > 0 && (
          <View style={styles.lineTotalRow}>
            <Text style={styles.lineTotalLabel}>{labels.lineTotal}</Text>
            <AppAmount value={lineTotal} size={16} />
          </View>
        )}
      </View>
    </AppCard>
  );
};
