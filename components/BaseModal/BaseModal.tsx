import React, { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Button, { BUTTON_STYLE } from '../Button/Button';

interface BaseModalProps {
	open: boolean;
	children?: ReactNode
	onClose: () => void;
	onAction?: () => void;
	actionTitle?: string;
}

function BaseModal({ open, children, onClose, onAction, actionTitle = 'Save' }: BaseModalProps): ReactElement {

	return(
		open ? (
			<View style={styles.container}>
				<View style={styles.content}>
					{children}
					<View style={styles.buttons}>
						<Button label='Close' onPress={onClose} style={BUTTON_STYLE.OUTLINE}  customStyle={styles.button}/>
						{!!onAction && <Button label={actionTitle}onPress={onAction} customStyle={styles.button}/>}
					</View>
				</View>
			</View>
		) : <></>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0,0,0, 0.7)',
		position: 'absolute',
		padding: 30

	},
	content: {
		backgroundColor: 'white',
		padding: 30,
		borderRadius: 10
	},
	buttons: {
		display: 'flex',
		flexDirection: 'row',
		gap: 20
	},
	button: {
		flex: 1
	}
});

export default BaseModal