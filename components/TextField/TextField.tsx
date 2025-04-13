import React, { ReactElement } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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

// Enum for inputMode
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
	inputMode?: InputMode
	keyboardType?: KeyboardType
	label: string;
}

function TextField(params: TextFieldProps): ReactElement {

	const {
		value, 
		setValue, 
		inputMode = InputMode.Text, 
		keyboardType = KeyboardType.DecimalPad,
		label
	} = params;


	return (
		<View>
			<Text>{label}</Text>
			<TextInput
				style={styles.textInput}
				placeholder="Enter number"
				value={`${value}`}
				onChangeText={setValue}
				keyboardType={keyboardType}
				inputMode={inputMode}
				testID="test-number-input"
				accessibilityLabel="Number Input Field"
			/>
		</View>
		
	)
}


const styles = StyleSheet.create({
	textInput: {
		width: '80%',
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
		fontSize: 18,
		textAlign: 'center',
	}
});


export default TextField;