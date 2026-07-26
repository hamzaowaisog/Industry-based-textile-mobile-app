import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppAvatar } from '@components/common/AppAvatar';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppHijriDateLabel } from '@components/common/AppHijriDateLabel';
import { BillNoInlineList } from '@components/common/BillNoInlineList';

import { formatAmount } from '@utils/helpers/formatCurrency';
import { getInitials } from '@utils/helpers/textHelpers';
import { getPaymentDirectionColor, isPaymentReceived } from '@utils/helpers/paymentContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { PaymentCardProps } from '../../../../types/payments.types';
import { styles } from './styles';

export const PaymentCard = React.memo(({ payment, onPress }: PaymentCardProps) => {
  const { t } = useTranslation();
  const received = isPaymentReceived(payment.paymentDirectionId);
  const directionColor = getPaymentDirectionColor(payment.paymentDirectionId);
  const billNos = payment.billNos ?? [];

  return (
    <View style={payment.isReversed ? styles.reversed : undefined}>
      <AppCard onPress={() => onPress(payment.id)} padding={14}>
        <View style={styles.row}>
          <AppAvatar
            label={getInitials(payment.partyClientName)}
            color={directionColor}
            size={44}
          />

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {payment.partyClientName}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {`${payment.paymentDate} · ${payment.transModeName}`}
            </Text>
            {billNos.length === 1 ? (
              <Text style={styles.billNo} numberOfLines={1}>
                {t('payments.billNoLabel', { billNo: billNos[0] })}
              </Text>
            ) : (
              <BillNoInlineList billNos={billNos} />
            )}
            <AppHijriDateLabel value={payment.paymentDateHijriDisplay} />
          </View>

          <View style={styles.right}>
            <AppAmount value={payment.amount} tone={received ? 'credit' : 'debit'} size={15} />
            {payment.isReversed ? (
              <AppBadge
                label={t('payments.detail.reversed')}
                bg={colors.dangerLight}
                fg={colors.danger}
                size="sm"
              />
            ) : (
              <AppBadge
                label={payment.paymentDirectionName}
                bg={received ? colors.successLight : colors.warningLight}
                fg={directionColor}
                size="sm"
              />
            )}
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.reference}>{`HT-PAYMENT-${payment.id}`}</Text>
          {payment.unallocatedAmount > 0 && (
            <AppBadge
              label={t('payments.unallocatedBadge', {
                amount: `${AppConstants.APP.CURRENCY} ${formatAmount(payment.unallocatedAmount)}`,
              })}
              bg={colors.warningLight}
              fg={colors.warning}
              size="sm"
            />
          )}
        </View>
      </AppCard>
    </View>
  );
});
