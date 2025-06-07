import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import BaseModal from '../BaseModal/BaseModal';
import TextField, { InputMode, KeyboardType } from '../TextField/TextField';
import { Subzone, Zone } from '../../hooks/useIrrigation.hook';
import CheckBox from '@react-native-community/checkbox';
import { useWebSocket } from '../../context/WebSocketContext';
import Checkbox from '../Checkbox/Checkbox';

interface ManualIrrigationModelProps {
	open: boolean;
	zone?: Zone;
	onClose: () => void;
}

type SubzoneControl = Subzone & {
	isChecked?: boolean;
}

function ManualIrrigationModel({open, zone, onClose}: ManualIrrigationModelProps): ReactElement {

	const [time, setTime] = useState<string>('')
	const [subzones, setSubzones] = useState<SubzoneControl[]>([])

	const { sendMessage } = useWebSocket()
	
	const handleChange = (text: string) => {
		setTime(text);
	};

	const onCheckSubzones = (sz: SubzoneControl) => {
		console.log(sz)
		const temp: SubzoneControl[] = [...subzones]
		console.log(temp)
		const sub = temp.find(t => t.id === sz.id)
		console.log(sub)
		if (!sub) return;

		sub.isChecked = !sub.isChecked
		console.log(temp)
		setSubzones(temp)
	}

	const startZone = () => {
		if (!time) return
		sendMessage('request', {
			priority: 1,
			duration: +time,
			zone: zone!.zone,
			subzones: subzones.filter(sz => sz.isChecked).map(sz => ({
				id: sz.subzone,
				state: 1
			}))
		})
		onClose()
	}

	useEffect(() => {
		if (!zone) setSubzones([])
		setSubzones(zone?.subzones ? zone.subzones : [])
	}, [zone])

	return (
		<BaseModal open={open} onClose={onClose} onAction={startZone} actionTitle='Start'>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<View style={{}}>

				<Text style={styles.title}>{zone?.name}</Text>
						
						<TextField 
							value={time}
							setValue={handleChange}
							label={"Duration"}
							keyboardType={KeyboardType.Numeric}
							inputMode={InputMode.Numeric}
						/>
						{subzones.map(sz => (
							<View key={sz.id} style={styles.subzone}>
								<Checkbox label={sz.name} setChecked={() => onCheckSubzones(sz)} checked={!!sz.isChecked}/>
							</View>
						))}

			</View>
		
			</TouchableWithoutFeedback>	
			
		

		</BaseModal>
		
	)
}


const styles = StyleSheet.create({

	title: {
		fontSize: 20,
		margin: 'auto'
	}, 
	textInput: {
		width: '80%',
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
		fontSize: 18,
	},
	checkbox: {
		transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
	},
	subzone: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 10,

		textAlign: 'center'

	},
	subzoneName: {
		height: 30,
		lineHeight: 30,
		textAlign: 'center',
		marginLeft: 10,
	}
});



export default ManualIrrigationModel;