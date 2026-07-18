import React from 'react';

import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';

import { REPORT_CARDS } from '@utils/helpers/reportsContent';

import { colors } from '@theme/colors';

import { MenuIcon, PdfIcon } from '@constants/svgAssets';

import type { ReportsHubComponentProps } from '../../../types/reports.types';
import { styles } from './styles';

export const ReportsHubComponent = ({
  onSelectReport,
  onMenuPress,
  onReportPdfPress,
  pdfDownloadingReport,
}: ReportsHubComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={onMenuPress} activeOpacity={0.7}>
          <MenuIcon size={23} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('reports.hub.title')}</Text>
        <Text style={styles.headerSub}>{t('reports.hub.subtitle')}</Text>
      </View>

      <View style={styles.grid}>
        {REPORT_CARDS.map((card) => {
          const isDownloading = pdfDownloadingReport === card.key;
          return (
            <View key={card.key} style={styles.cardWrap}>
              <AppCard padding={16} onPress={() => onSelectReport(card.key)}>
                <View style={styles.cardBody}>
                  <AppIconTile Icon={card.Icon} color={card.color} size={44} />
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {t(card.titleKey)}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {t(card.descKey)}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.viewBtn, { backgroundColor: card.color + '14' }]}
                      onPress={() => onSelectReport(card.key)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.viewBtnText, { color: card.color }]}>
                        {t('reports.hub.view')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pdfBtn}
                      onPress={() => onReportPdfPress(card.key)}
                      activeOpacity={0.75}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <PdfIcon size={14} color={colors.text} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </AppCard>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};
