import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import BaseModal from '../BaseModal/BaseModal';
import TextField, { InputMode, KeyboardType } from '../TextField/TextField';
import useIrrigation from '../../hooks/useIrrigation.hook';
import TimePicker from '../TimePicker.tsx/TimePicker';
import Checkbox from '../Checkbox/Checkbox';

interface CreateScheduleModalProps {
	open: boolean;
	onClose: () => void;
	onSave: () => void
}


function CreateScheduleModal({open, onClose, onSave}: CreateScheduleModalProps): ReactElement {

	const [name, setName] = useState<string>('');
	const [duration, setDuration] = useState<string>('');
	const [startHour, setStartHour] = useState<string>('');
	const [startMinutes, setStartMinutes] = useState<string>('');
	const [monday, setMonday] = useState<boolean>(false);
	const [tuesday, setTuesday] = useState<boolean>(false);
	const [wednesday, setWednesday] = useState<boolean>(false);
	const [thursday, setThursday] = useState<boolean>(false);
	const [friday, setFriday] = useState<boolean>(false);
	const [saturday, setSaturday] = useState<boolean>(false);
	const [sunday, setSunday] = useState<boolean>(false);

	const { createSchedule } = useIrrigation()
	const onCreate = async () => {
		if (!monday && !tuesday && !wednesday && !thursday && !friday && !saturday && !sunday) return
		if (!name.trim()) return;
		if (!startHour.trim()) return;
		if (!startMinutes.trim()) return;
		if (!duration.trim() || isNaN(+duration)) return;

		await createSchedule({
			monday,
			tuesday,
			wednesday,
			thursday,
			friday,
			saturday,
			sunday,
			name,
			duration: +duration,
			startTime: `${startHour}:${startMinutes}`
		})
		onSave()
	}

	const changeTime = (hour: string, minutes: string) => {
		setStartHour(hour)
		setStartMinutes(minutes)
	}
	return (
		<BaseModal open={open} onClose={onClose} onAction={onCreate} actionTitle='Create'>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
					<ScrollView
						contentContainerStyle={{ paddingBottom: 20 }}
						keyboardShouldPersistTaps="handled" // 👈 KEY setting!
					>
						<TextField 
							value={name}
							setValue={setName}
							label={"Name"}
							keyboardType={KeyboardType.Default}
						/>
						<TextField 
							value={duration}
							setValue={setDuration}
							label={"Duration"}
							keyboardType={KeyboardType.DecimalPad}
							inputMode={InputMode.Decimal}
						/>

						<TimePicker  onChange={changeTime} hour={startHour} minute={startMinutes} />

						<Checkbox checked={monday} setChecked={() => setMonday(prev => !prev)} label='Monday'/>
						<Checkbox checked={tuesday} setChecked={() => setTuesday(prev => !prev)} label='Tuesday'/>
						<Checkbox checked={wednesday} setChecked={() => setWednesday(prev => !prev)} label='Wednesday'/>
						<Checkbox checked={thursday} setChecked={() => setThursday(prev => !prev)} label='Thursday'/>
						<Checkbox checked={friday} setChecked={() => setFriday(prev => !prev)} label='Friday'/>
						<Checkbox checked={saturday} setChecked={() => setSaturday(prev => !prev)} label='Saturday'/>
						<Checkbox checked={sunday} setChecked={() => setSunday(prev => !prev)} label='Sunday'/>
					</ScrollView>
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



export default CreateScheduleModal;