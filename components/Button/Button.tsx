import React, {ReactElement} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {COLORS, RADIUS, SPACING} from '../../lib/theme';

export enum BUTTON_STYLE {
  SOLID = 'solid',
  OUTLINE = 'outline',
  DANGER = 'danger',
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  style?: BUTTON_STYLE;
  customStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

function Button({
  onPress,
  label,
  style = BUTTON_STYLE.SOLID,
  customStyle,
  disabled,
}: ButtonProps): ReactElement {
  const getStyle = () => {
    switch (style) {
      case BUTTON_STYLE.SOLID:
        return styles.solid;
      case BUTTON_STYLE.OUTLINE:
        return styles.outline;
      case BUTTON_STYLE.DANGER:
        return styles.danger;
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch (style) {
      case BUTTON_STYLE.OUTLINE:
        return styles.outlineText;
      default:
        return styles.solidText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getStyle(),
        disabled && styles.disabled,
        customStyle,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <Text style={[styles.label, getTextStyle()]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    height: 48,
    paddingHorizontal: SPACING.md,
  },
  solid: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  solidText: {
    color: COLORS.surface,
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export default Button;
