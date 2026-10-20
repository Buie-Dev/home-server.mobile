import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRowing } from '../../hooks/useRowing.hook';
import { useWebSocket } from '../../context/WebSocketContext';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../../lib/theme';
import type { Race, RaceEntry, RaceStatus, RaceType } from '../../api/rowing.api';

type RootStackParamList = {
  Rowing: undefined;
  RaceTimer: { raceId: number };
};

type RaceTimerRouteProp = RouteProp<RootStackParamList, 'RaceTimer'>;
type RaceTimerNavProp = NativeStackNavigationProp<RootStackParamList, 'RaceTimer'>;

type Role = 'start' | 'finish' | 'observer';

function formatElapsed({ ms }: { ms: number }): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const secs = totalSec % 60;
  const mins = Math.floor(totalSec / 60);
  return `${mins}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function formatTime({ ts }: { ts: number }): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function statusBadgeColor({ status }: { status: RaceStatus }): string {
  if (status === 'active') return COLORS.success;
  if (status === 'completed') return COLORS.textMuted;
  return COLORS.warning;
}

function statusBadgeLabel({ status }: { status: RaceStatus }): string {
  if (status === 'active') return 'Active';
  if (status === 'completed') return 'Completed';
  return 'Pending';
}

function raceTypeBadgeLabel({ raceType }: { raceType: RaceType }): string {
  return raceType === 'time_trial' ? 'Time Trial' : 'Side by Side';
}

function placementEmoji({ placement }: { placement: number }): string {
  if (placement === 1) return '🥇';
  if (placement === 2) return '🥈';
  if (placement === 3) return '🥉';
  return `#${placement}`;
}

type ElapsedTickerProps = {
  startTime: number;
};

function ElapsedTicker({ startTime }: ElapsedTickerProps): ReactElement {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Text style={styles.elapsedTicker}>{formatElapsed({ ms: elapsed })}</Text>
  );
}

type EntryCardProps = {
  entry: RaceEntry;
  race: Race;
  role: Role;
  liveStartTime: number | undefined;
  displayPlacement?: number | null;
  onStart: ({ entry }: { entry: RaceEntry }) => void;
  onFinish: ({ entry }: { entry: RaceEntry }) => void;
  onDns: ({ entry }: { entry: RaceEntry }) => void;
  onDnf: ({ entry }: { entry: RaceEntry }) => void;
  onRemove: ({ entry }: { entry: RaceEntry }) => void;
};

function EntryCard({
  entry,
  race,
  role,
  liveStartTime,
  displayPlacement,
  onStart,
  onFinish,
  onDns,
  onDnf,
  onRemove,
}: EntryCardProps): ReactElement {
  const effectiveStartTime = liveStartTime ?? entry.startTime;
  const isOnCourse = effectiveStartTime !== null && effectiveStartTime !== undefined && !entry.finishTime && !entry.dns && !entry.dnf;
  const isFinished = entry.elapsedMs !== null && !entry.dns && !entry.dnf;
  const isPending = !effectiveStartTime && !entry.dns && !entry.dnf;

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryCardHeader}>
        <View style={styles.entryCardTitle}>
          <Text style={styles.entryBoatName}>{entry.boatName}</Text>
          {entry.keyPerson ? (
            <Text style={styles.entryKeyPerson}>{entry.keyPerson}</Text>
          ) : null}
        </View>

        {isFinished && (displayPlacement ?? entry.placement) !== null && (
          <Text style={styles.placementEmoji}>{placementEmoji({ placement: (displayPlacement ?? entry.placement)! })}</Text>
        )}
        {entry.dns && (
          <View style={styles.statusBadgeDns}>
            <Text style={styles.statusBadgeTextDns}>DNS</Text>
          </View>
        )}
        {entry.dnf && (
          <View style={styles.statusBadgeDnf}>
            <Text style={styles.statusBadgeTextDnf}>DNF</Text>
          </View>
        )}
      </View>

      {isFinished && entry.elapsedMs !== null && (
        <View style={styles.finishedTimeRow}>
          <Icon name="timer-outline" size={14} color={COLORS.success} />
          <Text style={styles.finishedTime}>{formatElapsed({ ms: entry.elapsedMs })}</Text>
          {entry.finishTime && (
            <Text style={styles.wallTime}>@ {formatTime({ ts: entry.finishTime })}</Text>
          )}
          {entry.wbtPct !== null && (
            <Text style={styles.wbtBadge}>{entry.wbtPct.toFixed(1)}% WBT{entry.wbtIsEstimated ? '*' : ''}</Text>
          )}
        </View>
      )}

      {isOnCourse && effectiveStartTime !== null && effectiveStartTime !== undefined && (
        <View style={styles.onCourseRow}>
          <ElapsedTicker startTime={effectiveStartTime} />
          <Text style={styles.startedAtLabel}>started {formatTime({ ts: effectiveStartTime })}</Text>
        </View>
      )}

      {(isPending || isOnCourse) && race.status !== 'completed' && role !== 'observer' && (
        <View style={styles.entryActions}>
          {isPending && role === 'start' && race.raceType === 'time_trial' && (
            <TouchableOpacity
              style={styles.actionBtnStart}
              onPress={() => onStart({ entry })}
            >
              <Icon name="flag" size={14} color={COLORS.surface} />
              <Text style={styles.actionBtnText}>Start</Text>
            </TouchableOpacity>
          )}
          {isPending && role === 'start' && (
            <TouchableOpacity
              style={styles.actionBtnDns}
              onPress={() => onDns({ entry })}
            >
              <Text style={styles.actionBtnTextDns}>DNS</Text>
            </TouchableOpacity>
          )}
          {isOnCourse && role === 'finish' && (
            <>
              <TouchableOpacity
                style={styles.actionBtnFinish}
                onPress={() => onFinish({ entry })}
              >
                <Icon name="flag-checkered" size={14} color={COLORS.surface} />
                <Text style={styles.actionBtnText}>Finish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnDnf}
                onPress={() => onDnf({ entry })}
              >
                <Text style={styles.actionBtnTextDnf}>DNF</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.removeEntryBtn}
        onPress={() => onRemove({ entry })}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function RaceTimer(): ReactElement {
  const navigation = useNavigation<RaceTimerNavProp>();
  const route = useRoute<RaceTimerRouteProp>();
  const { raceId } = route.params;

  const { latestRowingStartEvent, latestRowingFinishEvent } = useWebSocket();
  const {
    activeRace,
    loadRace,
    finishRace,
    sendBoatStart,
    sendBoatFinish,
    setEntryDns,
    setEntryDnf,
    removeEntry,
  } = useRowing();

  const [role, setRole] = useState<Role>('observer');
  const [rankBy, setRankBy] = useState<'time' | 'wbt'>('wbt');
  const [liveStarts, setLiveStarts] = useState<Record<number, number>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const orderRef = useRef<number[] | null>(null);

  const race: Race | null = activeRace;

  useEffect(() => {
    loadRace({ id: raceId });
  }, [raceId, loadRace]);

  useEffect(() => {
    if (latestRowingStartEvent && latestRowingStartEvent.raceId === raceId) {
      loadRace({ id: raceId });
    }
  }, [latestRowingStartEvent, raceId, loadRace]);

  useEffect(() => {
    if (latestRowingFinishEvent && latestRowingFinishEvent.raceId === raceId) {
      loadRace({ id: raceId });
    }
  }, [latestRowingFinishEvent, raceId, loadRace]);

  const orderedEntries = useMemo<RaceEntry[]>(() => {
    if (!race) return [];

    if (race.status === 'completed') {
      if (rankBy === 'wbt') {
        return [...race.entries].sort((a, b) => (b.wbtPct ?? -1) - (a.wbtPct ?? -1));
      }
      return [...race.entries].sort((a, b) => {
        if (a.placement !== null && b.placement !== null) return a.placement - b.placement;
        if (a.placement !== null) return -1;
        if (b.placement !== null) return 1;
        return 0;
      });
    }

    if (orderRef.current === null && race.entries.length > 0) {
      orderRef.current = race.entries.map((e) => e.id);
    }

    if (orderRef.current) {
      const order = orderRef.current;
      return [...race.entries].sort((a, b) => {
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }

    return race.entries;
  }, [race, rankBy]);

  const allStarted = useMemo(() => {
    if (!race) return false;
    return race.entries.every((e) => e.startTime !== null || e.dns || e.dnf || liveStarts[e.id] !== undefined);
  }, [race, liveStarts]);

  const allDone = useMemo(() => {
    if (!race) return false;
    return race.entries.every(
      (e) => (e.elapsedMs !== null) || e.dns || e.dnf,
    );
  }, [race]);

  const handleStartAll = useCallback(async () => {
    if (!race) return;
    const now = Date.now();
    const newStarts: Record<number, number> = {};
    const pending = race.entries.filter(
      (e) => !e.startTime && !e.dns && !e.dnf && liveStarts[e.id] === undefined,
    );
    pending.forEach((e) => { newStarts[e.id] = now; });
    setLiveStarts((prev) => ({ ...prev, ...newStarts }));
    try {
      await Promise.all(
        pending.map((e) =>
          sendBoatStart({ raceId, entryId: e.id, boatName: e.boatName, timestamp: now }),
        ),
      );
    } catch {
      Alert.alert('Error', 'Failed to start all entries.');
    }
  }, [race, liveStarts, sendBoatStart, raceId]);

  const handleStart = useCallback(async ({ entry }: { entry: RaceEntry }) => {
    const now = Date.now();
    setLiveStarts((prev) => ({ ...prev, [entry.id]: now }));
    try {
      await sendBoatStart({ raceId, entryId: entry.id, boatName: entry.boatName, timestamp: now });
    } catch {
      Alert.alert('Error', 'Failed to record start.');
      setLiveStarts((prev) => {
        const next = { ...prev };
        delete next[entry.id];
        return next;
      });
    }
  }, [sendBoatStart, raceId]);

  const handleFinish = useCallback(({ entry }: { entry: RaceEntry }) => {
    const effectiveStart = liveStarts[entry.id] ?? entry.startTime;
    if (!effectiveStart) {
      Alert.alert('Error', 'No start time recorded for this entry.');
      return;
    }
    const now = Date.now();
    const elapsed = now - effectiveStart;
    Alert.alert(
      'Record Finish',
      `${entry.boatName} — ${formatElapsed({ ms: elapsed })}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await sendBoatFinish({ raceId, entryId: entry.id, boatName: entry.boatName, timestamp: now, elapsedMs: elapsed });
            } catch {
              Alert.alert('Error', 'Failed to record finish.');
            }
          },
        },
      ],
    );
  }, [liveStarts, sendBoatFinish, raceId]);

  const handleDns = useCallback(({ entry }: { entry: RaceEntry }) => {
    Alert.alert(
      'Did Not Start',
      `Mark ${entry.boatName} as DNS?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DNS',
          style: 'destructive',
          onPress: async () => {
            try {
              await setEntryDns({ entryId: entry.id });
            } catch {
              Alert.alert('Error', 'Failed to mark DNS.');
            }
          },
        },
      ],
    );
  }, [setEntryDns]);

  const handleDnf = useCallback(({ entry }: { entry: RaceEntry }) => {
    Alert.alert(
      'Did Not Finish',
      `Mark ${entry.boatName} as DNF?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DNF',
          style: 'destructive',
          onPress: async () => {
            try {
              await setEntryDnf({ entryId: entry.id });
            } catch {
              Alert.alert('Error', 'Failed to mark DNF.');
            }
          },
        },
      ],
    );
  }, [setEntryDnf]);

  const handleComplete = useCallback(() => {
    Alert.alert(
      'Complete Race',
      'Mark this race as completed? This will finalise placements.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsCompleting(true);
            try {
              await finishRace({ id: raceId });
            } catch {
              Alert.alert('Error', 'Failed to complete race.');
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ],
    );
  }, [finishRace, raceId]);

  const handleRemoveEntry = useCallback(({ entry }: { entry: RaceEntry }) => {
    Alert.alert(
      'Remove Entry',
      `Remove ${entry.boatName} from this race?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeEntry({ entryId: entry.id });
            } catch {
              Alert.alert('Error', 'Failed to remove entry.');
            }
          },
        },
      ],
    );
  }, [removeEntry]);

  if (!race) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="arrow-left" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Race Timer</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const stColor = statusBadgeColor({ status: race.status });
  const stLabel = statusBadgeLabel({ status: race.status });
  const typeLabel = raceTypeBadgeLabel({ raceType: race.raceType });
  const isSideBySide = race.raceType === 'side_by_side';

  const showStartAll = race.status !== 'completed' && isSideBySide && role === 'start' && !allStarted;
  const showComplete = race.status !== 'completed' && allDone;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-left" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{race.distance}m</Text>
          <Text style={styles.headerSubtitle}>{typeLabel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: stColor + '20' }]}>
          <Text style={[styles.statusBadgeText, { color: stColor }]}>{stLabel}</Text>
        </View>
      </View>

      {race.status !== 'completed' && (
        <View style={styles.roleBar}>
          {(['start', 'finish', 'observer'] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Icon
                name={r === 'start' ? 'flag-outline' : r === 'finish' ? 'flag-checkered' : 'eye-outline'}
                size={16}
                color={role === r ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                {r === 'start' ? 'Start Line' : r === 'finish' ? 'Finish Line' : 'Observer'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {(showStartAll || showComplete) && (
        <View style={styles.actionBar}>
          {showStartAll && (
            <TouchableOpacity
              style={styles.startAllBtn}
              onPress={handleStartAll}
            >
              <Icon name="flag" size={18} color={COLORS.surface} />
              <Text style={styles.activateBtnText}>Start All</Text>
            </TouchableOpacity>
          )}
          {showComplete && (
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting
                ? <ActivityIndicator size="small" color={COLORS.surface} />
                : (
                  <>
                    <Icon name="flag-checkered" size={18} color={COLORS.surface} />
                    <Text style={styles.activateBtnText}>Complete Race</Text>
                  </>
                )
              }
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orderedEntries.length === 0 ? (
          <View style={styles.centered}>
            <Icon name="rowing" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No entries in this race</Text>
          </View>
        ) : (() => {
          const hasWbt = orderedEntries.some((e) => e.wbtPct !== null);
          const wbtRanks = new Map(
            orderedEntries
              .filter((e) => e.wbtPct !== null)
              .sort((a, b) => (b.wbtPct ?? -1) - (a.wbtPct ?? -1))
              .map((e, i) => [e.id, i + 1])
          );
          return (
            <>
              {race.status === 'completed' && hasWbt && (
                <View style={styles.rankToggleRow}>
                  <Text style={styles.rankToggleLabel}>Rank by</Text>
                  <TouchableOpacity style={[styles.rankToggleBtn, rankBy === 'time' && styles.rankToggleBtnActive]} onPress={() => setRankBy('time')}>
                    <Text style={[styles.rankToggleBtnText, rankBy === 'time' && styles.rankToggleBtnTextActive]}>Time</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.rankToggleBtn, rankBy === 'wbt' && styles.rankToggleBtnActive]} onPress={() => setRankBy('wbt')}>
                    <Text style={[styles.rankToggleBtnText, rankBy === 'wbt' && styles.rankToggleBtnTextActive]}>WBT%</Text>
                  </TouchableOpacity>
                </View>
              )}
              {orderedEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  race={race}
                  role={role}
                  liveStartTime={liveStarts[entry.id]}
                  displayPlacement={rankBy === 'wbt' ? (wbtRanks.get(entry.id) ?? null) : entry.placement}
                  onStart={handleStart}
                  onFinish={handleFinish}
                  onDns={handleDns}
                  onDnf={handleDnf}
                  onRemove={handleRemoveEntry}
                />
              ))}
            </>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}

export default RaceTimer;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  roleBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleBtnTextActive: {
    color: COLORS.primary,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  startAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.textSecondary,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  activateBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  entryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    position: 'relative' as const,
    ...SHADOWS.card,
  },
  removeEntryBtn: {
    position: 'absolute' as const,
    top: SPACING.xs,
    right: SPACING.xs,
    padding: SPACING.xs,
  },
  entryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  entryCardTitle: {
    flex: 1,
    gap: 2,
  },
  entryBoatName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  entryKeyPerson: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  placementEmoji: {
    fontSize: 22,
  },
  statusBadgeDns: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusBadgeTextDns: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statusBadgeDnf: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusBadgeTextDnf: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.warning,
  },
  rankToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  rankToggleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  rankToggleBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankToggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rankToggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rankToggleBtnTextActive: {
    color: COLORS.surface,
  },
  finishedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  finishedTime: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.success,
    fontVariant: ['tabular-nums'],
  },
  wallTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  wbtBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  onCourseRow: {
    gap: 2,
  },
  elapsedTicker: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  startedAtLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  entryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtnStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  actionBtnFinish: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  actionBtnDns: {
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  actionBtnDnf: {
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.warning,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
  },
  actionBtnTextDns: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  actionBtnTextDnf: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.warning,
  },
});
