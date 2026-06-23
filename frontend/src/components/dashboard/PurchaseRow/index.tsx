import { View } from 'react-native';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { getStatusStyle } from '@utils/helpers/dashboardContent';

import { colors } from '@theme/colors';

import { TruckIcon } from '@constants/svgAssets';

import type { PurchaseRowProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const PurchaseRow = ({ purchase, isLast }: PurchaseRowProps) => {
  const s = getStatusStyle(purchase.statusName);
  return (
    <>
      <View style={styles.row}>
        <AppRow
          leading={<AppIconTile Icon={TruckIcon} color={colors.warning} size={40} />}
          primary={purchase.supplierName}
          secondary={`#${purchase.purchaseId} · ${purchase.purchaseDate}`}
          right={
            <>
              <AppAmount value={purchase.total} size={14} />
              <AppBadge label={purchase.statusName} bg={s.bg} fg={s.fg} size="sm" />
            </>
          }
        />
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};
