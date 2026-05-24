import React, { ReactElement } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../lib/theme';

export enum KeyboardType {
  Default = 'default',
  Numeric = 'numeric',
  NumberPad = 'number-pad',
  DecimalPad = 'decimal-pad',
  EmailAddress = 'email-address',
  PhonePad = 'phone-pad',
  VisiblePassword = 'visible-password',
  Url = 'url',
}

export enum InputMode {
  Text = 'text',
  None = 'none',
  Email = 'email',
  Tel = 'tel',
  Url = 'url',
  Numeric = 'numeric',
  Decimal = 'decimal',
  Search = 'search',
}

interface TextFieldProps {
  value: string | number;
  setValue: (value: string) => void;
  inputMode?: InputMode;
  keyboardType?: KeyboardType;
  label?: string;
  placeholder?: string;
}

function TextField({ value, setValue, inputMode = InputMode.Text, keyboardType = KeyboardType.Default, label, placeholder }: TextFieldProps): ReactElement {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={`${value}`}
        onChangeText={setValue}
        keyboardType={keyboardType}
        inputMode={inputMode}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        testID="test-number-input"
        accessibilityLabel="Number Input Field"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
});

export default TextField;
