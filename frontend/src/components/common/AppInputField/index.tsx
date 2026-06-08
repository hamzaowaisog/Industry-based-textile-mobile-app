import React from 'react';

import { Text, TextInput, View } from 'react-native';

import type { InputFieldProps } from '@types/clients.types';

import { colors } from '@theme/colors';

import { styles } from './styles';

export const AppInputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      onBlur,
      placeholder,
      error,
      helper,
      leading,
      keyboardType = 'default',
      returnKeyType = 'next',
      onSubmitEditing,
      editable = true,
    },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View
          style={[
            styles.inputRow,
            focused && styles.inputRowFocused,
            !!error && styles.inputRowError,
            !editable && styles.inputRowDisabled,
          ]}
        >
          {leading}
          <TextInput
            ref={ref}
            style={styles.input}
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
            returnKeyType={returnKeyType}
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
