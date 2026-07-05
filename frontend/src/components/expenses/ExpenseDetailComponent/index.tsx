import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { PdfButton } from '@components/common/PdfButton';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, EditIcon, ReceiptIcon, TrashIcon } from '@constants/svgAssets';

import {
  getExpenseCategoryColor,
  getExpenseCategoryLightColor,
} from '@utils/helpers/expenseContent';

import type { ExpenseDetailComponentProps } from '../../../types/expenses.types';
import { ExpenseDetailSkeleton } from './ExpenseDetailSkeleton';
import { styles } from './styles';

export const ExpenseDetailComponent = ({
  expense,
  loading,
  submitting,
  canUpdate,
  canDelete,
  onBack,
  onEdit,
  onDelete,
  onDossierPdfPress,
  isDossierPdfDownloading,
}: ExpenseDetailComponentProps) => {
  const { t } = useTranslation();

  if (loading) return <ExpenseDetailSkeleton />;

  if (!expense) {
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

  const categoryColor = getExpenseCategoryColor(expense.expenseTypeId);
  const categoryLightColor = getExpenseCategoryLightColor(expense.expenseTypeId);

  return (
    <View style={styles.root}>
      <SafeAreaView
        style={[styles.heroSafeArea, { backgroundColor: categoryLightColor }]}
        edges={['top']}
      >
        <View style={styles.heroNav}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeftIcon size={20} color={categoryColor} />
          </TouchableOpacity>
          <View style={styles.heroNavActions}>
            <PdfButton
              onPress={onDossierPdfPress}
              isLoading={isDossierPdfDownloading}
              size={20}
              color={categoryColor}
            />
            {canUpdate && (
              <TouchableOpacity
                style={[styles.heroNavBtn, submitting && styles.btnDisabled]}
                onPress={() => onEdit(expense.id)}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <EditIcon size={20} color={categoryColor} />
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={[styles.heroDeleteBtn, submitting && styles.btnDisabled]}
                onPress={onDelete}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <TrashIcon size={20} color={categoryColor} />
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
        <View style={[styles.heroBody, { backgroundColor: categoryLightColor }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroRef}>
              {t('expenses.detail.reference', { id: expense.id })}
            </Text>
            <View style={styles.statusPill}>
              <ReceiptIcon size={13} color={categoryColor} />
              <Text style={[styles.statusPillText, { color: categoryColor }]}>
                {expense.expenseTypeName}
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {expense.notes?.trim() || expense.expenseTypeName}
          </Text>
          <AppAmount value={expense.amount} tone="debit" size={34} />
          <Text style={styles.heroMeta}>
            {`${expense.expenseDate} · ${expense.transModeName}`}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('expenses.detail.mode')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {expense.transModeName}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('expenses.detail.ledgerCategory')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {expense.transCategoryName || '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('expenses.detail.recordedBy')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {expense.recordedByName ?? '—'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('expenses.detail.category')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('expenses.category')}</Text>
              <Text style={styles.infoValue}>{expense.expenseTypeName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('expenses.expenseDate')}</Text>
              <Text style={styles.infoValue}>{expense.expenseDate}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>{t('expenses.detail.createdAt')}</Text>
              <Text style={styles.infoValue}>{expense.createdAt ?? '—'}</Text>
            </View>
          </View>
        </View>

        {!!expense.notes?.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('expenses.notes')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{expense.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
