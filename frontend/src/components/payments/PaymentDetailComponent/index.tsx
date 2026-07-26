import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppCard } from '@components/common/AppCard';
import { AppHijriDateLabel } from '@components/common/AppHijriDateLabel';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { PdfButton } from '@components/common/PdfButton';

import { formatPKR } from '@utils/helpers/formatCurrency';
import {
  PAYMENT_DIRECTION_ICONS,
  getPaymentDirectionConfig,
  isPaymentReceived,
} from '@utils/helpers/paymentContent';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, EditIcon, TrashIcon, UserIcon } from '@constants/svgAssets';

import type { PaymentDetailComponentProps } from '../../../types/payments.types';
import { PaymentDetailSkeleton } from './PaymentDetailSkeleton';
import { styles } from './styles';

const renderDirectionIcon = (directionId: number, color: string, size: number): React.ReactNode => {
  const Icon = PAYMENT_DIRECTION_ICONS[directionId];
  return Icon ? <Icon size={size} color={color} /> : null;
};

export const PaymentDetailComponent = ({
  payment,
  loading,
  submitting,
  canUpdate,
  canDelete,
  canReverse,
  onBack,
  onClientPress,
  onEdit,
  onReverse,
  onDelete,
  onDossierPdfPress,
  isDossierPdfDownloading,
}: PaymentDetailComponentProps) => {
  const { t } = useTranslation();

  if (loading) return <PaymentDetailSkeleton />;

  if (!payment) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.errorHeader}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{t('common.errorGeneric')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = getPaymentDirectionConfig(payment.paymentDirectionId);
  const received = isPaymentReceived(payment.paymentDirectionId);
  const canEdit = canUpdate && !payment.isReversed;
  const allocatedTotal = payment.allocations.reduce(
    (sum, a) => sum + (a.allocatedAmount ?? 0),
    0,
  );
  const unallocatedAmount = payment.amount - allocatedTotal;

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ backgroundColor: config.bg }} edges={['top']}>
        <View style={styles.heroNav}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeftIcon size={20} color={config.fg} />
          </TouchableOpacity>
          <View style={styles.heroNavActions}>
            <PdfButton
              onPress={onDossierPdfPress}
              isLoading={isDossierPdfDownloading}
              size={20}
              color={config.fg}
            />
            {canEdit && (
              <TouchableOpacity
                style={[styles.heroNavBtn, submitting && styles.btnDisabled]}
                onPress={() => onEdit(payment.id)}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <EditIcon size={20} color={config.fg} />
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={[styles.heroDeleteBtn, submitting && styles.btnDisabled]}
                onPress={onDelete}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <TrashIcon size={20} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBody, { backgroundColor: config.bg }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroRef}>
              {t('payments.detail.reference', { id: payment.id })}
            </Text>
            <View style={styles.statusPill}>
              {renderDirectionIcon(payment.paymentDirectionId, config.fg, 13)}
              <Text style={[styles.statusPillText, { color: config.fg }]}>
                {payment.isReversed ? t('payments.detail.reversed') : payment.paymentDirectionName}
              </Text>
            </View>
          </View>
          <Text style={styles.heroClient} numberOfLines={2}>
            {payment.partyClientName}
          </Text>
          <AppAmount
            value={payment.amount}
            tone={received ? 'credit' : 'debit'}
            size={34}
          />
          <Text style={styles.heroMeta}>
            {`${payment.paymentDate} · ${payment.transModeName}`}
          </Text>
          <AppHijriDateLabel value={payment.paymentDateHijriDisplay} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('payments.transMode')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {payment.transModeName}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('payments.detail.allocations')}</Text>
            <Text style={styles.statValue}>{formatPKR(allocatedTotal)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('payments.detail.recordedBy')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {payment.recordedByName ?? '—'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payments.client')}</Text>
          <AppCard padding={0}>
            <View style={styles.clientRowWrap}>
              <AppRow
                leading={<AppIconTile Icon={UserIcon} color={colors.primary} size={40} />}
                primary={payment.partyClientName}
                secondary={payment.paymentDate}
                onPress={() => onClientPress(payment.partyClientId)}
              />
            </View>
          </AppCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payments.detail.allocations')}</Text>
          <AppCard padding={14}>
            {payment.allocations.length === 0 && unallocatedAmount <= 0 ? (
              <Text style={styles.emptyAlloc}>{t('payments.detail.noAllocations')}</Text>
            ) : (
              payment.allocations.map((a, i) => (
                <View
                  key={a.id ?? i}
                  style={[
                    styles.allocationRow,
                    unallocatedAmount <= 0 &&
                      i === payment.allocations.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.allocationLabel}>
                    {a.billNo
                      ? t('payments.billNoLabel', { billNo: a.billNo })
                      : a.orderId
                        ? `ORD-${a.orderId}`
                        : a.purchaseId
                          ? `PUR-${a.purchaseId}`
                          : '—'}
                  </Text>
                  <AppAmount value={a.allocatedAmount ?? 0} size={14} />
                </View>
              ))
            )}
            {unallocatedAmount > 0 && (
              <View style={[styles.allocationRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.allocationLabel}>{t('payments.detail.unallocated')}</Text>
                <AppAmount value={unallocatedAmount} size={14} />
              </View>
            )}
          </AppCard>
        </View>

        {!!payment.notes?.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payments.notes')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{payment.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {canReverse && !payment.isReversed && (
        <AppBottomBar>
          <TouchableOpacity
            style={[styles.cancelBtn, submitting && styles.btnDisabled]}
            onPress={onReverse}
            disabled={submitting}
            activeOpacity={0.75}
          >
            <Text style={styles.cancelBtnText}>{t('payments.detail.reverse')}</Text>
          </TouchableOpacity>
        </AppBottomBar>
      )}
    </View>
  );
};
