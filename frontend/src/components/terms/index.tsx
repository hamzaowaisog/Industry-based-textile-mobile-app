import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { TermsComponentProps } from '@types/terms.types';

import { styles } from './styles';

export const TermsComponent = ({ onBack }: TermsComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('terms.sections.acceptance')}</Text>
        <Text style={styles.body}>{t('terms.sections.acceptanceBody')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.sections.use')}</Text>
        <Text style={styles.body}>{t('terms.sections.useBody')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.sections.accounts')}</Text>
        <Text style={styles.body}>{t('terms.sections.accountsBody')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.sections.data')}</Text>
        <Text style={styles.body}>{t('terms.sections.dataBody')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.sections.liability')}</Text>
        <Text style={styles.body}>{t('terms.sections.liabilityBody')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.sections.changes')}</Text>
        <Text style={styles.body}>{t('terms.sections.changesBody')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
