import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppButton } from '@components/common/AppButton';
import { AppCard } from '@components/common/AppCard';
import { AppHijriDateLabel } from '@components/common/AppHijriDateLabel';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { PdfButton } from '@components/common/PdfButton';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { getInvoiceStatusConfig } from '@utils/helpers/invoiceContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, EditIcon, FileTextIcon, TrashIcon, UserIcon } from '@constants/svgAssets';

import type { InvoiceDetailComponentProps } from '../../../types/invoices.types';
import { InvoiceDetailSkeleton } from './InvoiceDetailSkeleton';
import { styles } from './styles';

export const InvoiceDetailComponent = ({
  invoice,
  loading,
  submitting,
  canUpdate,
  canDelete,
  onBack,
  onClientPress,
  onEdit,
  onDelete,
  onIssue,
  onCancel,
  onDossierPdfPress,
  isDossierPdfDownloading,
}: InvoiceDetailComponentProps) => {
  const { t } = useTranslation();

  if (loading) return <InvoiceDetailSkeleton />;

  if (!invoice) {
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

  const config = getInvoiceStatusConfig(invoice.invoiceStatusId);
  // Manual invoice editing is disabled — standalone invoices can't be marked Paid yet.
  // const isLinkedInvoice = invoice.orderId !== null || invoice.purchaseId !== null;
  // const canEdit = canUpdate && isLinkedInvoice;
  const canDeleteInvoice = canDelete;
  const showIssue = canUpdate && invoice.invoiceStatusId === AppConstants.INVOICE_STATUS.DRAFT;
  const showCancel =
    canUpdate &&
    invoice.invoiceStatusId !== AppConstants.INVOICE_STATUS.CANCELLED &&
    invoice.invoiceStatusId !== AppConstants.INVOICE_STATUS.PAID;

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
            {/* Manual invoice editing is disabled — standalone invoices can't be marked Paid yet.
            {canEdit && (
              <TouchableOpacity
                style={[styles.heroNavBtn, submitting && styles.btnDisabled]}
                onPress={() => onEdit(invoice.id)}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <EditIcon size={20} color={config.fg} />
              </TouchableOpacity>
            )}
            */}
            {canDeleteInvoice && (
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
            <Text style={styles.heroRef}>{invoice.invoiceNumber}</Text>
            <View style={styles.statusPill}>
              <FileTextIcon size={13} color={config.fg} />
              <Text style={[styles.statusPillText, { color: config.fg }]}>
                {invoice.statusName}
              </Text>
            </View>
          </View>
          <Text style={styles.heroClient} numberOfLines={2}>
            {invoice.clientName}
          </Text>
          <AppAmount value={invoice.totalAmount} size={34} />
          <Text style={styles.heroMeta}>
            {`${t('invoices.detail.issued')} ${invoice.issueDate ?? '—'} · ${t(
              'invoices.detail.due',
            )} ${invoice.dueDate ?? '—'}`}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('invoices.detail.issued')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {invoice.issueDate ?? '—'}
            </Text>
            <AppHijriDateLabel value={invoice.issueDateHijriDisplay} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('invoices.detail.due')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {invoice.dueDate ?? '—'}
            </Text>
            <AppHijriDateLabel value={invoice.dueDateHijriDisplay} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('invoices.detail.outstanding')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {formatPKR(invoice.outstanding)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('invoices.detail.totalInvoice')}</Text>
          <AppCard padding={16}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('invoices.create.total')}</Text>
              <AppAmount value={invoice.totalAmount} size={16} />
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('invoices.detail.amountPaid')}</Text>
              <AppAmount value={invoice.amountPaid} size={15} tone="credit" />
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>{t('invoices.detail.outstanding')}</Text>
              <AppAmount value={invoice.outstanding} size={17} tone="debit" />
            </View>
          </AppCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payments.client')}</Text>
          <AppCard padding={0}>
            <View style={styles.clientRowWrap}>
              <AppRow
                leading={<AppIconTile Icon={UserIcon} color={colors.primary} size={40} />}
                primary={invoice.clientName}
                secondary={invoice.clientTypeName}
                chevron
                onPress={() => onClientPress(invoice.clientId)}
              />
            </View>
          </AppCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('invoices.detail.lineItems')}</Text>
          <AppCard padding={0}>
            {invoice.lines.length === 0 ? (
              <Text style={styles.emptyBody}>{t('invoices.detail.noLines')}</Text>
            ) : (
              invoice.lines.map((l, i) => (
                <View
                  key={l.id ?? i}
                  style={[
                    styles.lineRow,
                    i < invoice.lines.length - 1 && styles.lineRowBorder,
                  ]}
                >
                  <View style={styles.lineInfo}>
                    <Text style={styles.lineName} numberOfLines={2}>
                      {l.productName}
                    </Text>
                    <Text style={styles.lineSub}>{`${l.qty ?? 0} × ${formatPKR(
                      l.unitPrice ?? 0,
                    )}`}</Text>
                  </View>
                  <AppAmount value={l.lineTotal ?? 0} size={14} />
                </View>
              ))
            )}
          </AppCard>
        </View>

        {invoice.linkedTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('invoices.detail.linkedTransactions')}</Text>
            <AppCard padding={14}>
              {invoice.linkedTransactions.map((tx, i) => (
                <View
                  key={tx.transactionId ?? i}
                  style={[
                    styles.txRow,
                    i < invoice.linkedTransactions.length - 1 && styles.txRowBorder,
                  ]}
                >
                  <View>
                    <Text style={styles.txCategory}>{tx.categoryName}</Text>
                    <Text style={styles.txSub}>{`${tx.transDate} · ${tx.typeName}`}</Text>
                  </View>
                  <AppAmount value={tx.amount ?? 0} size={14} />
                </View>
              ))}
            </AppCard>
          </View>
        )}

        {!!invoice.notes?.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payments.notes')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {(showIssue || showCancel) && (
        <AppBottomBar>
          <View style={styles.bottomBarRow}>
            {showCancel && (
              <View style={showIssue ? styles.flexBtn : styles.flexFull}>
                <AppButton
                  variant="ghost"
                  label={t('invoices.detail.cancel')}
                  onPress={onCancel}
                  loading={submitting}
                  disabled={submitting}
                  size="lg"
                  fullWidth
                />
              </View>
            )}
            {showIssue && (
              <View style={styles.flexBtn}>
                <AppButton
                  variant="success"
                  label={t('invoices.detail.issue')}
                  onPress={onIssue}
                  loading={submitting}
                  disabled={submitting}
                  size="lg"
                  fullWidth
                />
              </View>
            )}
          </View>
        </AppBottomBar>
      )}
    </View>
  );
};
