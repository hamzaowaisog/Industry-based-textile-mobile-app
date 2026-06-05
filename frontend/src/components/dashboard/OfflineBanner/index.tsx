import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { styles } from './styles';

export const OfflineBanner = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.text}>{t('dashboard.offlineBannerText')}</Text>
    </View>
  );
};
