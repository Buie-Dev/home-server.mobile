import React, {ReactElement} from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BaseModal from '../BaseModal/BaseModal';
import useIrrigation, {Schedule} from '../../hooks/useIrrigation.hook';

interface DeleteScheduleConfirmationModalProps {
  schedule?: Schedule;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteScheduleConfirmationModal({
  onClose,
  onDelete,
  schedule,
}: DeleteScheduleConfirmationModalProps): ReactElement {
  const {deleteSchedule} = useIrrigation();

  const onDeleteSchedule = async () => {
    if (!schedule) return;
    await deleteSchedule(schedule.id);
    onDelete();
  };

  return (
    <BaseModal
      open={!!schedule}
      onClose={onClose}
      onAction={onDeleteSchedule}
      actionTitle="Delete">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          <Text style={styles.title}>{`Delete ${schedule?.name}`}</Text>
          <Text>Are you sure you want to delete this schedule?</Text>
        </View>
      </TouchableWithoutFeedback>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    margin: 'auto',
  },
});

export default DeleteScheduleConfirmationModal;
