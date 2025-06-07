import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import TextField, { InputMode, KeyboardType } from '../TextField/TextField';

interface TimePickerProps {
	minute: string;
	hour: string;
  onChange: (hour: string, minute: string) => void; // return string in HH:mm
}



const formatDateToHHMM = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const TimePicker: React.FC<TimePickerProps> = ({ onChange, hour, minute }) => {
	const [localHour, setLocalHour] = useState<string>('')
	const [localMinutes, setLocalMinutes] = useState<string>('')

  const changeTime = (hour:  string, minute: string) => {
		onChange(hour, minute)
	}

	useEffect(() => {
		setLocalHour(hour)
		setLocalMinutes(minute)
	}, [hour, minute])

  return (
    <View style={{ padding: 10 }}>
      <TextField 
				value={hour}
				setValue={(hour: string) => changeTime(hour, localMinutes)}
				inputMode={InputMode.Numeric}
				keyboardType={KeyboardType.NumberPad}
			/>
			<TextField 
				value={localMinutes}
				setValue={(minute: string) => changeTime(localHour, minute)}
				inputMode={InputMode.Numeric}
				keyboardType={KeyboardType.NumberPad}
			/>
    </View>
  );
};

export default TimePicker
