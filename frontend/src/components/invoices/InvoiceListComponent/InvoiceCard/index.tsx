import React from 'react';

import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';

import { getInvoiceStatusConfig } from '@utils/helpers/invoiceContent';

import { colors } from '@theme/colors';

import { FileTextIcon, PdfIcon, ShareIcon } from '@constants/svgAssets';

import type { InvoiceCardProps } from '../../../../types/invoices.types';
import { styles } from './styles';

export const InvoiceCard = React.memo(
  ({ invoice, onPress, onViewPdf, onSharePdf, isViewing, isSharing }: InvoiceCardProps) => {
    const { t } = useTranslation();
    const config = getInvoiceStatusConfig(invoice.invoiceStatusId);
    const accent = invoice.isOverdue ? colors.danger : config.fg;

    return (
      <AppCard onPress={() => onPress(invoice.id)} padding={14}>
        <View style={styles.row}>
          <AppIconTile Icon={FileTextIcon} color={accent} size={44} />

          <View style={styles.info}>
            <View style={styles.topRow}>
              <Text style={styles.number} numberOfLines={1}>
                {invoice.invoiceNumber}
              </Text>
              <AppAmount value={invoice.totalAmount} size={16} />
            </View>

            <Text style={styles.client} numberOfLines={1}>
              {invoice.clientName}
            </Text>

            <View style={styles.bottomRow}>
              <Text style={[styles.due, invoice.isOverdue && styles.dueOverdue]} numberOfLines={1}>
                {invoice.isOverdue
                  ? `${t('invoices.overdue')} · ${t('invoices.duePrefix')} ${invoice.dueDate}`
                  : invoice.dueDate
                    ? `${t('invoices.duePrefix')} ${invoice.dueDate}`
                    : ''}
              </Text>
              <AppBadge label={invoice.statusName} bg={config.bg} fg={config.fg} size="sm" />
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => onViewPdf(invoice)}
            activeOpacity={0.7}
            disabled={isViewing}
          >
            {isViewing ? (
              <ActivityIndicator size="small" color={colors.violet} />
            ) : (
              <PdfIcon size={14} color={colors.violet} />
            )}
            <Text style={styles.viewBtnText}>{t('invoices.viewPdf')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => onSharePdf(invoice)}
            activeOpacity={0.7}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <ShareIcon size={14} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  },
);
