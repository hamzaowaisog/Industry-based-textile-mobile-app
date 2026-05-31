import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { PrivacyComponentProps } from '@types/privacy.types';

import { styles } from './styles';

export const PrivacyComponent = ({ onBack }: PrivacyComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('privacy.sections.collection')}</Text>
        <Text style={styles.body}>{t('privacy.sections.collectionBody')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.sections.usage')}</Text>
        <Text style={styles.body}>{t('privacy.sections.usageBody')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.sections.storage')}</Text>
        <Text style={styles.body}>{t('privacy.sections.storageBody')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.sections.sharing')}</Text>
        <Text style={styles.body}>{t('privacy.sections.sharingBody')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.sections.security')}</Text>
        <Text style={styles.body}>{t('privacy.sections.securityBody')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.sections.rights')}</Text>
        <Text style={styles.body}>{t('privacy.sections.rightsBody')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.sections.contact')}</Text>
        <Text style={styles.body}>{t('privacy.sections.contactBody')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
