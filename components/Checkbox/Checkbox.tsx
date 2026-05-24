import CheckBox from '@react-native-community/checkbox';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../lib/theme';

interface CheckboxProps {
  setChecked: () => void;
  checked: boolean;
  label: string;
}

function Checkbox({ checked, setChecked, label }: CheckboxProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={setChecked} activeOpacity={0.7}>
      <View style={{ transform: [{ scale: 0.85 }] }}>
        <CheckBox
          value={checked}
          onValueChange={() => {}}
          tintColors={{ true: COLORS.primary, false: COLORS.border }}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
});

export default Checkbox;
