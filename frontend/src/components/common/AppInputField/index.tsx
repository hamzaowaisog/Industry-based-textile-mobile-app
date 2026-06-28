import React from 'react';

import { Text, TextInput, View } from 'react-native';

import { FieldLabel } from '@components/common/FieldLabel';

import { colors } from '@theme/colors';

import type { InputFieldProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppInputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      required = false,
      value,
      onChangeText,
      onBlur,
      placeholder,
      error,
      helper,
      leading,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      returnKeyType = 'next',
      submitBehavior = 'submit',
      multiline = false,
      numberOfLines,
      onSubmitEditing,
      editable = true,
    },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <View style={styles.inputWrap}>
        <FieldLabel label={label} required={required} />
        <View
          style={[
            styles.inputRow,
            multiline && styles.inputRowMultiline,
            focused && styles.inputRowFocused,
            !!error && styles.inputRowError,
            !editable && styles.inputRowDisabled,
          ]}
        >
          {leading}
          <TextInput
            ref={ref}
            style={[styles.input, multiline && styles.inputMultiline]}
            value={value}
            onChangeText={onChangeText}
            onBlur={() => {
              setFocused(false);
              onBlur();
            }}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            returnKeyType={multiline ? 'default' : returnKeyType}
            submitBehavior={submitBehavior}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onSubmitEditing={onSubmitEditing}
            editable={editable}
          />
        </View>
        {error ? <Text style={styles.inputError}>{error}</Text> : null}
        {!error && helper ? <Text style={styles.inputHelper}>{helper}</Text> : null}
      </View>
    );
  },
);

AppInputField.displayName = 'AppInputField';
