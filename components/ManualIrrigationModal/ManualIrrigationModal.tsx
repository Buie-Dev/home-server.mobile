import React, { ReactElement, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import BaseModal from '../BaseModal/BaseModal';
import TextField, { InputMode, KeyboardType } from '../TextField/TextField';
import { Subzone, Zone } from '../../hooks/useIrrigation.hook';
import Checkbox from '../Checkbox/Checkbox';
import { useWebSocket } from '../../context/WebSocketContext';
import { COLORS, SPACING } from '../../lib/theme';

interface ManualIrrigationModelProps {
  open: boolean;
  zone?: Zone;
  onClose: () => void;
}

type SubzoneControl = Subzone & {
  isChecked?: boolean;
};

function ManualIrrigationModel({ open, zone, onClose }: ManualIrrigationModelProps): ReactElement {
  const [time, setTime] = useState<string>('');
  const [subzones, setSubzones] = useState<SubzoneControl[]>([]);
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    setSubzones(zone?.subzones ?? []);
    setTime('');
  }, [zone]);

  const onCheckSubzones = (sz: SubzoneControl) => {
		console.log(sz)
		console.log(sz.isChecked)
		console.log(!sz.isChecked)

    setSubzones(prev =>
      prev.map(s => s.id === sz.id ? { ...s, isChecked: !s.isChecked } : s)
    );
  };

  const startZone = () => {
    if (!time) return;
		console.log(subzones)
		console.log(subzones.filter(sz => sz.isChecked).map(sz => ({ id: sz.subzone, state: 1 })))
    sendMessage('request', {
      priority: 1,
      duration: +time,
      zone: zone!.zone,
      subzones: subzones.filter(sz => sz.isChecked).map(sz => ({ id: sz.subzone, state: 1 })),
    });
    onClose();
  };

	useEffect(() => {
		console.log(subzones)
		console.log(subzones.filter(sz => sz.isChecked).map(sz => ({ id: sz.subzone, state: 1 })))
	}, [subzones])

  return (
    <BaseModal open={open} title={zone?.name} onClose={onClose} onAction={startZone} actionTitle="Start">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          <TextField
            value={time}
            setValue={setTime}
            label="Duration (minutes)"
            keyboardType={KeyboardType.DecimalPad}
            inputMode={InputMode.Decimal}
            placeholder="e.g. 10"
          />
          {subzones.length > 0 && (
            <>
              <Text style={styles.subzoneLabel}>Subzones</Text>
              {subzones.map(sz => (
                <Checkbox
                  key={sz.id}
                  label={sz.name}
                  checked={!!sz.isChecked}
                  setChecked={() => onCheckSubzones(sz)}
                />
              ))}
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  subzoneLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
});

export default ManualIrrigationModel;
