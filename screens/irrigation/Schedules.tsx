import React, { ReactElement, useEffect, useState } from 'react';
import { Alert, Text, View, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useIrrigation, { Schedule } from '../../hooks/useIrrigation.hook';
import CreateScheduleModal from '../../components/CreateScheduleModal/CreateScheduleModal';
import DeleteScheduleConfirmationModal from '../../components/DeleteConfirmationScheduleModal/DeleteConfirmationScheduleModal';
import ZoneFilterBar from '../../components/ZoneFilterBar/ZoneFilterBar';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../../lib/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_KEYS: (keyof Schedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const formatDaysLabel = (s: Schedule) => {
  const active = DAY_KEYS.filter(k => s[k]);
  if (active.length === 7) return 'Every day';
  if (active.length === 5 && !s.saturday && !s.sunday) return 'Weekdays';
  if (active.length === 6 && !s.sunday) return 'Weekdays + Sat';
  if (active.length === 6 && !s.saturday) return 'Weekdays + Sun';
  return active.map((k, i) => DAYS[DAY_KEYS.indexOf(k)]).join(', ');
};

function Schedules(): ReactElement {
  const [openCreate, setOpenCreate] = useState(false);
  const { schedules, fetchSchedules, toggleSchedule, reorderSchedules, checkSync, forceSync, zoneDetails, fetchZones } = useIrrigation();
  const [selectedDelete, setSelectedDelete] = useState<Schedule>();
  const [selectedEdit, setSelectedEdit] = useState<Schedule | undefined>();
  const [syncChecking, setSyncChecking] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<number | undefined>();
  const [activeSubzoneId, setActiveSubzoneId] = useState<number | undefined>();

  useEffect(() => {
    fetchSchedules();
    fetchZones();
  }, []);

  const onZoneFilterChange = (zoneId?: number, subzoneId?: number) => {
    setActiveZoneId(zoneId);
    setActiveSubzoneId(subzoneId);
    fetchSchedules(zoneId, subzoneId);
  };

  const onCheckSync = async () => {
    setSyncChecking(true);
    const result = await checkSync();
    setSyncChecking(false);

    if (!result) {
      Alert.alert('Sync Check Failed', 'Could not reach the automation service.');
      return;
    }
    if (result.timeout) {
      Alert.alert('Sync Check Timeout', 'No response from the automation service.');
      return;
    }
    if (result.in_sync) {
      Alert.alert('In Sync', 'All schedules match the automation service.', [{ text: 'OK' }]);
      return;
    }

    const lines: string[] = [];
    if (result.missing_from_automation.length > 0) {
      lines.push(`Missing from automation: IDs ${result.missing_from_automation.join(', ')}`);
    }
    if (result.extra_in_automation.length > 0) {
      lines.push(`Extra in automation (inactive/deleted): IDs ${result.extra_in_automation.join(', ')}`);
    }
    result.mismatched.forEach(m => {
      lines.push(`Schedule ${m.id} mismatched:\n  ${m.diffs.join('\n  ')}`);
    });

    Alert.alert(
      'Out of Sync',
      lines.join('\n\n'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Sync',
          style: 'destructive',
          onPress: async () => {
            const r = await forceSync();
            if (r) Alert.alert('Synced', `${r.synced} schedule(s) re-synced to automation service.`);
          },
        },
      ],
    );
  };

  const onSave = () => {
    fetchSchedules(activeZoneId, activeSubzoneId);
    setOpenCreate(false);
  };

  const onDragEnd = async ({ data }: { data: Schedule[] }) => {
    await reorderSchedules(data.map(s => s.id));
    fetchSchedules(activeZoneId, activeSubzoneId);
  };

  const renderItem = ({ item: s, drag, isActive }: RenderItemParams<Schedule>) => (
    <ScaleDecorator>
      <View style={[styles.card, !s.active && styles.cardInactive, isActive && styles.cardDragging]}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
            <Icon name="drag-horizontal-variant" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.timeBlock}>
            <Icon name="clock-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.startTime}>{s.startTime}</Text>
          </View>
          <View style={styles.headerRight}>
            <Switch
              value={!!s.active}
              onValueChange={v => toggleSchedule(s.id, v)}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={s.active ? COLORS.primary : COLORS.textMuted}
              style={styles.switch}
            />
            <TouchableOpacity onPress={() => setSelectedEdit(s)} style={styles.deleteBtn}>
              <Icon name="pencil-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedDelete(s)} style={styles.deleteBtn}>
              <Icon name="trash-can-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name */}
        <Text style={[styles.scheduleName, !s.active && styles.textInactive]}>{s.name}</Text>

        {/* Day pills */}
        <View style={styles.dayRow}>
          {DAYS.map((d, i) => {
            const on = s[DAY_KEYS[i]] as boolean;
            return (
              <View key={d} style={[styles.dayPill, on && styles.dayPillActive]}>
                <Text style={[styles.dayLetter, on && styles.dayLetterActive]}>
                  {d[0]}
                </Text>
              </View>
            );
          })}
          <Text style={styles.daysLabel}>{formatDaysLabel(s)}</Text>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="timer-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{s.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="sprinkler-variant" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{s.zoneName}</Text>
          </View>
          {s.subzoneNames && (
            <View style={[styles.metaItem, styles.metaItemFlex]}>
              <Icon name="source-branch" size={13} color={COLORS.textSecondary} />
              <Text style={[styles.metaText, styles.metaTextFlex]} numberOfLines={1}>{s.subzoneNames}</Text>
            </View>
          )}
        </View>
      </View>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.screen}>
      <ZoneFilterBar zoneDetails={zoneDetails} onChange={onZoneFilterChange} />
      <DraggableFlatList
        data={schedules}
        onDragEnd={onDragEnd}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        style={styles.list_flex}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="calendar-clock" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No schedules yet</Text>
            <Text style={styles.emptySub}>Tap below to create your first schedule</Text>
          </View>
        }
      />

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.createBtn} onPress={() => setOpenCreate(true)}>
          <Icon name="plus" size={20} color={COLORS.surface} />
          <Text style={styles.createBtnText}>Create Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.syncBtn} onPress={onCheckSync} disabled={syncChecking}>
          {syncChecking
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <Icon name="sync" size={20} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <CreateScheduleModal open={openCreate} onClose={() => setOpenCreate(false)} onSave={onSave} />
      <CreateScheduleModal
        open={!!selectedEdit}
        editSchedule={selectedEdit}
        onClose={() => setSelectedEdit(undefined)}
        onSave={() => { setSelectedEdit(undefined); fetchSchedules(activeZoneId, activeSubzoneId); }}
      />
      <DeleteScheduleConfirmationModal
        schedule={selectedDelete}
        onClose={() => setSelectedDelete(undefined)}
        onDelete={() => {
          setSelectedDelete(undefined);
          fetchSchedules(activeZoneId, activeSubzoneId);
        }}
      />
    </GestureHandlerRootView>
  );
}

export default Schedules;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list_flex: {
    flex: 1,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl * 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardDragging: {
    ...SHADOWS.card,
    shadowOpacity: 0.25,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dragHandle: {
    padding: 4,
    marginRight: SPACING.xs,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  startTime: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  deleteBtn: {
    padding: 4,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  textInactive: {
    color: COLORS.textSecondary,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  dayPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillActive: {
    backgroundColor: COLORS.primary,
  },
  dayLetter: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  dayLetterActive: {
    color: COLORS.surface,
  },
  daysLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemFlex: {
    flex: 1,
    minWidth: 0,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaTextFlex: {
    flex: 1,
    flexShrink: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    gap: SPACING.sm,
  },
  createBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.card,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.surface,
  },
  syncBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
});
