import React, { useRef } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@components/common/AppBottomSheet';

import type { BillNoInlineListProps } from '../../../types/common.types';
import { styles } from './styles';

const INLINE_LIMIT = 3;

export const BillNoInlineList = ({ billNos }: BillNoInlineListProps) => {
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheetModal>(null);

  if (billNos.length === 0) return null;

  const visible = billNos.slice(0, INLINE_LIMIT);
  const hiddenCount = billNos.length - visible.length;

  return (
    <View style={styles.row}>
      <Text style={styles.text} numberOfLines={1}>
        {t('common.billNoInlineList.prefix')}
        {visible.join(', ')}
      </Text>
      {hiddenCount > 0 && (
        <TouchableOpacity onPress={() => sheetRef.current?.present()} activeOpacity={0.7}>
          <Text style={styles.more}>{t('common.billNoInlineList.more', { count: hiddenCount })}</Text>
        </TouchableOpacity>
      )}
      {hiddenCount > 0 && (
        <AppBottomSheet ref={sheetRef} snapPoints={['40%']}>
          <BottomSheetView style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{t('common.billNoInlineList.sheetTitle')}</Text>
            {billNos.map((billNo, index) => (
              <Text key={`${billNo}-${index}`} style={styles.sheetItem}>
                {billNo}
              </Text>
            ))}
          </BottomSheetView>
        </AppBottomSheet>
      )}
    </View>
  );
};
