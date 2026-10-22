import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import TextField, {InputMode, KeyboardType} from '../TextField/TextField';

interface TimePickerProps {
  minute: string;
  hour: string;
  onChange: (hour: string, minute: string) => void; // return string in HH:mm
}

const TimePicker: React.FC<TimePickerProps> = ({onChange, hour, minute}) => {
  const [localHour, setLocalHour] = useState<string>('');
  const [localMinutes, setLocalMinutes] = useState<string>('');

  const changeTime = (hour: string, minute: string) => {
    let localHour = hour;
    let localMinute = minute;
    if (parseInt(hour, 10) > 23) {
      localHour = '23';
    }
    if (parseInt(minute, 10) > 59) {
      localMinute = '59';
    }
    onChange(localHour, localMinute);
  };

  useEffect(() => {
    setLocalHour(hour);
    setLocalMinutes(minute);
  }, [hour, minute]);

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <View style={styles.inputContainer}>
          <TextField
            value={hour}
            label={'Hour'}
            setValue={(hour: string) => changeTime(hour, localMinutes)}
            inputMode={InputMode.Numeric}
            keyboardType={KeyboardType.NumberPad}
          />
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.inputContainer}>
          <TextField
            value={localMinutes}
            label={'Minute'}
            setValue={(minute: string) => changeTime(localHour, minute)}
            inputMode={InputMode.Numeric}
            keyboardType={KeyboardType.NumberPad}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 5,
    textAlign: 'center',
  },
  separator: {
    fontSize: 24,
    marginHorizontal: 10,
  },
});

export default TimePicker;
