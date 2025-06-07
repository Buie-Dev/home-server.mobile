import CheckBox from '@react-native-community/checkbox';
import { StyleSheet, Text, View } from 'react-native';

interface CheckboxProps {
	setChecked: () => void
	checked: boolean
	label: string
}
function Checkbox({checked, setChecked, label}: CheckboxProps) {

  return (
    <View style={styles.container}>
			<View style={{ transform: [{ scale: 0.8 }] }}>
				<CheckBox
					value={checked}
					onValueChange={setChecked}
					tintColors={{ true: '#4caf50', false: '#aaa' }}
				/>
			</View>
			<Text style={styles.label}>{label}</Text>

		</View>
  );
};


const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 10,

		textAlign: 'center'

	},
	label: {
		height: 30,
		lineHeight: 30,
		textAlign: 'center',
		marginLeft: 10,
	}
});


export default Checkbox
