import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppAvatar } from '@components/common/AppAvatar';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppHijriDateLabel } from '@components/common/AppHijriDateLabel';

import { getInitials } from '@utils/helpers/textHelpers';
import { getPaymentDirectionColor, isPaymentReceived } from '@utils/helpers/paymentContent';

import { colors } from '@theme/colors';

import type { PaymentCardProps } from '../../../../types/payments.types';
import { styles } from './styles';

export const PaymentCard = React.memo(({ payment, onPress }: PaymentCardProps) => {
  const { t } = useTranslation();
  const received = isPaymentReceived(payment.paymentDirectionId);
  const directionColor = getPaymentDirectionColor(payment.paymentDirectionId);

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
        </View>
      </AppCard>
    </View>
  );
});
