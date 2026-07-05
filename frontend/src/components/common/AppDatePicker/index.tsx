import { useState } from 'react';

import {
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { FieldLabel } from '@components/common/FieldLabel';

import { formatDateForDisplay, localDateToISO, toISODate } from '@utils/helpers/dateConvert';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { CalendarIcon } from '@constants/svgAssets';

import type { AppDatePickerProps } from '../../../types/common.types';
import { styles } from './styles';

const parseValueToDate = (value: string): Date => {
  const iso = toISODate(value);
  return iso ? new Date(`${iso}T00:00:00`) : new Date();
};

export const AppDatePicker = ({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  helper,
  maximumDate,
  minimumDate,
}: AppDatePickerProps) => {
  const { t } = useTranslation();
  const [iosVisible, setIosVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => parseValueToDate(value));

  const emitChange = (date: Date) => {
    onChange(localDateToISO(date));
  };

  const openPicker = () => {
    if (Platform.OS === AppConstants.PLATFORM.OS.ANDROID) {
      DateTimePickerAndroid.open({
        value: parseValueToDate(value),
        mode: 'date',
        maximumDate,
        minimumDate,
        onChange: (event: DateTimePickerEvent, selected?: Date) => {
          if (event.type === 'set' && selected) emitChange(selected);
        },
      });
      return;
    }
    setDraftDate(parseValueToDate(value));
    setIosVisible(true);
  };

  const confirmIos = () => {
    emitChange(draftDate);
    setIosVisible(false);
  };

  const display = formatDateForDisplay(value);

  return (
    <View style={styles.wrap}>
      {label ? <FieldLabel label={label} required={required} /> : null}
      <TouchableOpacity
        style={[styles.field, !!error && styles.fieldError]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Text style={[styles.value, !display && styles.placeholder]} numberOfLines={1}>
          {display || placeholder}
        </Text>
        <CalendarIcon size={18} color={colors.textTertiary} />
      </TouchableOpacity>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}

      {Platform.OS === AppConstants.PLATFORM.OS.IOS && (
        <Modal
          visible={iosVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIosVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.modalRoot}>
            <TouchableWithoutFeedback onPress={() => setIosVisible(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setIosVisible(false)}>
                  <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmIos}>
                  <Text style={styles.doneText}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.spinnerWrap}>
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="spinner"
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  onChange={(_, selected) => selected && setDraftDate(selected)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
