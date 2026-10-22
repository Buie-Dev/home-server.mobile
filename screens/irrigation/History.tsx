import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import useHistory, {
  HistoryFilters,
  IrrigationRun,
} from '../../hooks/useHistory.hook';
import useIrrigation from '../../hooks/useIrrigation.hook';
import ZoneFilterBar from '../../components/ZoneFilterBar/ZoneFilterBar';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';
import {formatVolume} from '../../lib/units';
import {useUnit} from '../../context/UnitContext';

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) {return `${s}s`;}
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const toDateParam = (date: Date) => date.toISOString().split('T')[0];

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const RunCard = ({
  run,
  useGallons,
  onDelete,
}: {
  run: IrrigationRun;
  useGallons: boolean;
  onDelete: () => void;
}) => (
  <View style={styles.runCard}>
    <View style={[styles.runAccent, {backgroundColor: COLORS.primary}]} />
    <View style={styles.runBody}>
      <View style={styles.runTop}>
        <Text style={styles.runZone}>{run.zoneName}</Text>
        <View style={styles.runStats}>
          <Icon name="timer-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.runStat}>
            {formatDuration(run.durationSeconds)}
          </Text>
          <Icon
            name="water-outline"
            size={13}
            color={COLORS.primary}
            style={{marginLeft: SPACING.sm}}
          />
          <Text style={[styles.runStat, {color: COLORS.primary}]}>
            {formatVolume(run.totalLitres ?? 0, useGallons)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="trash-can-outline" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.runBottom}>
        <Text style={styles.runType}>{run.subzoneName ?? run.zoneType}</Text>
        <Text style={styles.runDate}>{formatDate(run.startedAt)}</Text>
      </View>
    </View>
  </View>
);

function History() {
  const {
    history,
    totals,
    fetchHistory,
    loadMore,
    deleteHistory,
    loading,
    loadingMore,
  } = useHistory();
  const {zoneDetails, fetchZones} = useIrrigation();
  const {useGallons, toggleUnit} = useUnit();

  const [activeZoneId, setActiveZoneId] = useState<number | undefined>();
  const [activeSubzoneId, setActiveSubzoneId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory({
        zoneId: activeZoneId,
        subzoneId: activeSubzoneId,
        startDate: startDate ? toDateParam(startDate) : undefined,
        endDate: endDate ? toDateParam(endDate) : undefined,
      });
    }, [activeZoneId, activeSubzoneId, startDate, endDate]),
  );

  const buildFilters = (
    zoneId: number | undefined,
    subzoneId: number | undefined,
    start: Date | null,
    end: Date | null,
  ): HistoryFilters => ({
    zoneId,
    subzoneId,
    startDate: start ? toDateParam(start) : undefined,
    endDate: end ? toDateParam(end) : undefined,
  });

  const onZoneFilterChange = (zoneId?: number, subzoneId?: number) => {
    setActiveZoneId(zoneId);
    setActiveSubzoneId(subzoneId);
    fetchHistory(buildFilters(zoneId, subzoneId, startDate, endDate));
  };

  const onStartDateChange = (_: any, date?: Date) => {
    setShowStartPicker(false);
    if (date) {
      setStartDate(date);
      fetchHistory(buildFilters(activeZoneId, activeSubzoneId, date, endDate));
    }
  };

  const onEndDateChange = (_: any, date?: Date) => {
    setShowEndPicker(false);
    if (date) {
      setEndDate(date);
      fetchHistory(
        buildFilters(activeZoneId, activeSubzoneId, startDate, date),
      );
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    fetchHistory(buildFilters(activeZoneId, activeSubzoneId, null, null));
  };

  const ListHeader = (
    <View>
      {/* Water Usage Summary */}
      <View style={styles.sectionHeader}>
        <Icon name="water" size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Water Consumption</Text>
        <TouchableOpacity style={styles.unitToggle} onPress={toggleUnit}>
          <Text style={styles.unitToggleText}>{useGallons ? 'gal' : 'L'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text
            style={styles.statValue}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}>
            {totals ? formatVolume(totals.today.litres, useGallons) : '—'}
          </Text>
          <Text style={styles.statSub}>
            {totals?.today.minutes ?? 0}m · {totals?.today.runs ?? 0} run
            {totals?.today.runs !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text
            style={styles.statValue}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}>
            {totals ? formatVolume(totals.week.litres, useGallons) : '—'}
          </Text>
          <Text style={styles.statSub}>
            {totals?.week.minutes ?? 0}m · {totals?.week.runs ?? 0} run
            {totals?.week.runs !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text
            style={styles.statValue}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}>
            {totals ? formatVolume(totals.month.litres, useGallons) : '—'}
          </Text>
          <Text style={styles.statSub}>
            {totals?.month.minutes ?? 0}m · {totals?.month.runs ?? 0} run
            {totals?.month.runs !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Zone filter */}
      <ZoneFilterBar zoneDetails={zoneDetails} onChange={onZoneFilterChange} />

      {/* Date range */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => {
            if (!startDate) {
              const today = new Date();
              setStartDate(today);
              fetchHistory(
                buildFilters(activeZoneId, activeSubzoneId, today, endDate),
              );
            }
            setShowStartPicker(true);
          }}>
          <Icon name="calendar-start" size={15} color={COLORS.textSecondary} />
          <Text
            style={[
              styles.dateFieldText,
              !startDate && styles.dateFieldPlaceholder,
            ]}>
            {startDate ? formatDateShort(startDate) : 'Start date'}
          </Text>
        </TouchableOpacity>
        <View style={styles.dateSeparator} />
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowEndPicker(true)}>
          <Icon name="calendar-end" size={15} color={COLORS.textSecondary} />
          <Text
            style={[
              styles.dateFieldText,
              !endDate && styles.dateFieldPlaceholder,
            ]}>
            {endDate ? formatDateShort(endDate) : 'End date'}
          </Text>
        </TouchableOpacity>
        {(startDate || endDate) && (
          <TouchableOpacity onPress={clearDates} style={styles.dateClear}>
            <Icon name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStartPicker(false)}>
          <View style={styles.modalCard}>
            <DateTimePicker
              value={startDate ?? new Date()}
              mode="date"
              display="inline"
              maximumDate={endDate ?? endOfToday()}
              onChange={onStartDateChange}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEndPicker(false)}>
          <View style={styles.modalCard}>
            <DateTimePicker
              value={endDate ?? new Date()}
              mode="date"
              display="inline"
              minimumDate={startDate ?? undefined}
              maximumDate={endOfToday()}
              onChange={onEndDateChange}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* History List header */}
      <View style={[styles.sectionHeader, {marginTop: SPACING.lg}]}>
        <Icon name="history" size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Run History</Text>
        <TouchableOpacity
          onPress={() =>
            fetchHistory(
              buildFilters(activeZoneId, activeSubzoneId, startDate, endDate),
            )
          }
          style={styles.refreshBtn}>
          <Icon name="refresh" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      )}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={loading ? [] : history}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <RunCard
          run={item}
          useGallons={useGallons}
          onDelete={() =>
            Alert.alert(
              'Delete Run',
              'Remove this irrigation run from history?',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteHistory(item.id),
                },
              ],
            )
          }
        />
      )}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyState}>
            <Icon name="history" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptySub}>
              Past irrigation runs will appear here
            </Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingMore}
          />
        ) : null
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
    />
  );
}

export default History;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: SPACING.md, paddingBottom: SPACING.xl},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  refreshBtn: {padding: SPACING.xs},
  unitToggle: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  unitToggleText: {fontSize: 12, fontWeight: '700', color: COLORS.primary},
  statsRow: {flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md},
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  statValue: {fontSize: 22, fontWeight: '700', color: COLORS.primary},
  statSub: {fontSize: 11, color: COLORS.textMuted, marginTop: 2},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  dateFieldText: {fontSize: 13, fontWeight: '500', color: COLORS.textPrimary},
  dateFieldPlaceholder: {color: COLORS.textMuted},
  dateSeparator: {width: 1, height: 20, backgroundColor: COLORS.divider},
  dateClear: {paddingRight: SPACING.md},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  loader: {marginTop: SPACING.xl},
  loadingMore: {marginVertical: SPACING.md},
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyTitle: {fontSize: 16, fontWeight: '600', color: COLORS.textSecondary},
  emptySub: {fontSize: 13, color: COLORS.textMuted},
  runCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  runAccent: {width: 4},
  runBody: {flex: 1, padding: SPACING.md},
  runTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  runZone: {fontSize: 15, fontWeight: '600', color: COLORS.textPrimary},
  runStats: {flexDirection: 'row', alignItems: 'center', gap: 3},
  deleteBtn: {marginLeft: SPACING.sm},
  runStat: {fontSize: 13, color: COLORS.textSecondary},
  runBottom: {flexDirection: 'row', justifyContent: 'space-between'},
  runType: {fontSize: 12, color: COLORS.textMuted, textTransform: 'capitalize'},
  runDate: {fontSize: 12, color: COLORS.textMuted},
});
