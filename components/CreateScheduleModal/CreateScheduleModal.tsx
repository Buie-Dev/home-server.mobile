import React, {ReactElement, useEffect, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BaseModal from '../BaseModal/BaseModal';
import TextField, {InputMode, KeyboardType} from '../TextField/TextField';
import useIrrigation, {
  Schedule,
  Zone,
  ZoneType,
} from '../../hooks/useIrrigation.hook';
import TimePicker from '../TimePicker.tsx/TimePicker';
import Checkbox from '../Checkbox/Checkbox';
import {Dropdown} from '../Dropdown/Dropdown';
import {COLORS, RADIUS, SHADOWS, SPACING} from '../../lib/theme';

interface CreateScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editSchedule?: Schedule;
}

function CreateScheduleModal({
  open,
  onClose,
  onSave,
  editSchedule,
}: CreateScheduleModalProps): ReactElement {
  const {
    zones,
    fetchZones,
    createSchedule,
    updateSchedule,
    fetchZoneTypes,
    zoneTypes,
  } = useIrrigation();
  const [selectedZone, setSelectedZone] = useState<Zone>();
  const [selectedSubzoneIds, setSelectedSubzoneIds] = useState<number[]>([]);
  const [zoneType, setZoneType] = useState<ZoneType>();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinutes, setStartMinutes] = useState('');
  const [monday, setMonday] = useState(false);
  const [tuesday, setTuesday] = useState(false);
  const [wednesday, setWednesday] = useState(false);
  const [thursday, setThursday] = useState(false);
  const [friday, setFriday] = useState(false);
  const [saturday, setSaturday] = useState(false);
  const [sunday, setSunday] = useState(false);

  useEffect(() => {
    fetchZones(zoneType?.id);
    if (!editSchedule) {setSelectedZone(undefined);}
  }, [zoneType]);

  useEffect(() => {
    if (open) {
      fetchZoneTypes();
      if (editSchedule) {
        const [h, m] = editSchedule.startTime.split(':');
        setName(editSchedule.name);
        setDuration(String(editSchedule.duration));
        setStartHour(h);
        setStartMinutes(m);
        setMonday(editSchedule.monday);
        setTuesday(editSchedule.tuesday);
        setWednesday(editSchedule.wednesday);
        setThursday(editSchedule.thursday);
        setFriday(editSchedule.friday);
        setSaturday(editSchedule.saturday);
        setSunday(editSchedule.sunday);
        setSelectedSubzoneIds(editSchedule.subzoneIds ?? []);
      }
    } else {
      setSelectedZone(undefined);
      setSelectedSubzoneIds([]);
      setZoneType(undefined);
      setName('');
      setStartHour('');
      setStartMinutes('');
      setDuration('');
      setMonday(false);
      setTuesday(false);
      setWednesday(false);
      setThursday(false);
      setFriday(false);
      setSaturday(false);
      setSunday(false);
    }
  }, [open]);

  // Pre-select zone once zones list is loaded (edit mode)
  useEffect(() => {
    if (editSchedule && zones.length > 0 && !selectedZone) {
      const match = zones.find(z => z.id === editSchedule.zoneId);
      if (match) {setSelectedZone(match);}
    }
  }, [zones, editSchedule]);

  const onSavePress = async () => {
    if (!selectedZone) {return;}
    if (selectedZone.subzones && selectedSubzoneIds.length === 0) {return;}
    if (
      !monday &&
      !tuesday &&
      !wednesday &&
      !thursday &&
      !friday &&
      !saturday &&
      !sunday
    )
      {return;}
    if (!name.trim() || !startHour.trim() || !startMinutes.trim()) {return;}
    if (!duration.trim() || isNaN(+duration)) {return;}

    const params = {
      zoneId: selectedZone.id,
      subzoneIds: selectedSubzoneIds,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      name,
      duration: +duration,
      startTime: `${startHour}:${startMinutes}`,
    };

    if (editSchedule) {
      await updateSchedule(editSchedule.id, params);
    } else {
      await createSchedule(params);
    }
    onSave();
  };

  const DAYS = [
    {label: 'Monday', value: monday, set: () => setMonday(p => !p)},
    {label: 'Tuesday', value: tuesday, set: () => setTuesday(p => !p)},
    {label: 'Wednesday', value: wednesday, set: () => setWednesday(p => !p)},
    {label: 'Thursday', value: thursday, set: () => setThursday(p => !p)},
    {label: 'Friday', value: friday, set: () => setFriday(p => !p)},
    {label: 'Saturday', value: saturday, set: () => setSaturday(p => !p)},
    {label: 'Sunday', value: sunday, set: () => setSunday(p => !p)},
  ];

  return (
    <BaseModal
      open={open}
      title={editSchedule ? 'Edit Schedule' : 'Create Schedule'}
      onClose={onClose}
      onAction={onSavePress}
      actionTitle={editSchedule ? 'Save' : 'Create'}
      fullScreen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Name & Time */}
          <View style={styles.section}>
            <TextField
              value={name}
              setValue={setName}
              label="Name"
              keyboardType={KeyboardType.Default}
            />
            <TimePicker
              onChange={(h, m) => {
                setStartHour(h);
                setStartMinutes(m);
              }}
              hour={startHour}
              minute={startMinutes}
            />
            <TextField
              value={duration}
              setValue={setDuration}
              label="Duration (minutes)"
              keyboardType={KeyboardType.DecimalPad}
              inputMode={InputMode.Decimal}
            />
          </View>

          {/* Days */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Days</Text>
            {DAYS.map(d => (
              <Checkbox
                key={d.label}
                label={d.label}
                checked={d.value}
                setChecked={d.set}
              />
            ))}
          </View>

          {/* Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zone</Text>
            <Dropdown
              label={zoneType?.type ?? 'All Zone Types'}
              style={styles.dropdown}
              items={[
                {id: '0', label: 'All', onPress: () => setZoneType(undefined)},
                ...zoneTypes.map(z => ({
                  id: z.id.toString(),
                  label: z.type,
                  onPress: () => setZoneType(z),
                })),
              ]}
            />
            {zones.map((z: Zone) => {
              const isSelected = selectedZone?.id === z.id;
              return (
                <View key={z.id}>
                  <TouchableOpacity
                    style={[
                      styles.zoneCard,
                      isSelected && styles.zoneCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedZone(z);
                      setSelectedSubzoneIds([]);
                    }}>
                    <Text
                      style={[
                        styles.zoneName,
                        isSelected && styles.zoneNameSelected,
                      ]}>
                      {z.name}
                    </Text>
                    <Text
                      style={[
                        styles.zoneType,
                        isSelected && styles.zoneTypeSelected,
                      ]}>
                      {z.type}
                    </Text>
                  </TouchableOpacity>

                  {isSelected && z.subzones && (
                    <View style={styles.subzones}>
                      {z.subzones.map(sz => {
                        const checked = selectedSubzoneIds.includes(sz.id);
                        return (
                          <TouchableOpacity
                            key={sz.id}
                            style={[
                              styles.subzoneCard,
                              checked && styles.subzoneCardSelected,
                            ]}
                            onPress={() =>
                              setSelectedSubzoneIds(prev =>
                                prev.includes(sz.id)
                                  ? prev.filter(id => id !== sz.id)
                                  : [...prev, sz.id],
                              )
                            }>
                            <Text
                              style={[
                                styles.subzoneName,
                                checked && styles.subzoneNameSelected,
                              ]}>
                              {sz.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  dropdown: {
    marginBottom: SPACING.md,
  },
  zoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  zoneCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  zoneNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  zoneType: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  zoneTypeSelected: {
    color: COLORS.primary,
  },
  subzones: {
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  subzoneCard: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  subzoneCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  subzoneName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  subzoneNameSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default CreateScheduleModal;
