import React, { ReactElement } from 'react';
import { StyleSheet, Text, TextInput, View, Button as ReactButton, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';

export enum BUTTON_STYLE {
	SOLID = 'solid',
	OUTLINE = 'outline'
}

interface ButtonProps {
	label: string;
	onPress: () => void;
	style?: BUTTON_STYLE;
	customStyle?: StyleProp<ViewStyle>;
}

function Button(params: ButtonProps): ReactElement {

	const {
		onPress,
		label,
		style = BUTTON_STYLE.SOLID,
		customStyle
	} = params;

	const getStyle = () => {
		switch (style) {
			case BUTTON_STYLE.SOLID:
				return styles.buttonSolid
			case BUTTON_STYLE.OUTLINE:
				return styles.buttonOutline
			default:
				 return {}
		}
	}


	return (
		<TouchableOpacity style={[styles.button, getStyle(), customStyle]} onPress={onPress}>
			<Text>{label}</Text>
		</TouchableOpacity>
	)
}


const styles = StyleSheet.create({
	button: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 5,
		height: 50,
		textAlign: 'center',
	},
	buttonOutline: {
		borderColor: 'blue',
		borderWidth: 2,
		borderStyle: 'solid',
	},
	buttonSolid: {
		backgroundColor: 'red',
	}

});


export default Button;