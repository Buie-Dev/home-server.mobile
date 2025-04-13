import { useState } from 'react';
import { Checkbox as ReactCheckbox } from 'react-native-paper';

interface CheckboxProps {
	setChecked: () => void
	checked: boolean
}
function Checkbox({checked, setChecked}: CheckboxProps) {

  return (
    <ReactCheckbox
      status={checked ? 'checked' : 'unchecked'}
      onPress={setChecked}
    />
  );
};

export default Checkbox
