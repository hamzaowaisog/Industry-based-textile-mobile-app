import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowGap: {
    marginTop: 16,
  },
  gap: {
    width: 16,
  },
  netProfitWrap: {
    flexDirection: 'row',
    marginTop: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  orderDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 52,
  },
  orderInfo: {
    flex: 1,
    gap: 6,
  },
  orderSub: {
    marginTop: 2,
  },
  cardSpacing: {
    marginTop: 12,
  },
});
