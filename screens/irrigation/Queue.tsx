import React, {ReactElement, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useIrrigation from '../../hooks/useIrrigation.hook';
import {useWebSocket} from '../../context/WebSocketContext';
import {formatTime} from '../../lib/datetime';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';
import {formatVolume} from '../../lib/units';
import {useUnit} from '../../context/UnitContext';

function Queue(): ReactElement {
  const {priorityQueue, stopAll, stopQueueItem} = useIrrigation();
  const {liveFlow} = useWebSocket();
  const {useGallons} = useUnit();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const activeItem = priorityQueue[0] ?? null;
  const queuedItems = priorityQueue.slice(1);

  useEffect(() => {
    if (!activeItem) {
      setRemainingTime(null);
      return;
    }

    const totalDuration = activeItem.duration;
    let initialRemaining = totalDuration;

    if (activeItem.startTime) {
      const elapsed = Math.floor(
        (Date.now() - activeItem.startTime * 1000) / 1000,
      );
      initialRemaining = Math.max(0, totalDuration - elapsed);
    }

    setRemainingTime(initialRemaining);

    const progress =
      totalDuration > 0 ? 1 - initialRemaining / totalDuration : 0;
    progressAnim.setValue(progress);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        const next = prev - 1;
        if (totalDuration > 0) {
          Animated.timing(progressAnim, {
            toValue: 1 - next / totalDuration,
            duration: 900,
            useNativeDriver: false,
          }).start();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeItem?.id]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.screen}>
      {!activeItem && (
        <View style={styles.emptyState}>
          <Icon name="water-off-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No active irrigation</Text>
          <Text style={styles.emptySub}>Start a zone from the Zones tab</Text>
        </View>
      )}

      {activeItem && (
        <View style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <View style={styles.activePulse}>
              <Icon name="water" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.activeLabel}>Running now</Text>
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => stopQueueItem(activeItem.id)}>
              <Icon name="stop-circle-outline" size={20} color={COLORS.error} />
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.activeZone}>{activeItem.name}</Text>
          <Text style={styles.activeType}>{activeItem.zoneType}</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, {width: progressWidth}]}
            />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              {remainingTime !== null
                ? formatTime(remainingTime) + ' remaining'
                : '—'}
            </Text>
            <Text style={styles.progressText}>
              {formatTime(activeItem.duration)} total
            </Text>
          </View>

          {liveFlow?.id === activeItem.id && (
            <View style={styles.liveFlowRow}>
              <Icon name="water" size={14} color={COLORS.primary} />
              <Text style={styles.liveFlowText}>
                {formatVolume(liveFlow.litres, useGallons)} used
              </Text>
            </View>
          )}

          {activeItem.subZones && activeItem.subZones.length > 0 && (
            <View style={styles.subzones}>
              {activeItem.subZones.map(sz => (
                <View key={sz.id} style={styles.subzonePill}>
                  <Text style={styles.subzoneName}>{sz.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {queuedItems.length > 0 && (
        <>
          <View style={styles.queueHeader}>
            <Text style={styles.queueTitle}>Up Next</Text>
            <TouchableOpacity style={styles.stopAllBtn} onPress={stopAll}>
              <Icon name="cancel" size={14} color={COLORS.error} />
              <Text style={styles.stopAllText}>Stop All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.queueList}>
            {queuedItems.map((item, index) => (
              <View key={item.id} style={styles.queueCard}>
                <View style={styles.queueIndex}>
                  <Text style={styles.queueIndexText}>{index + 2}</Text>
                </View>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueZone}>{item.name}</Text>
                  <Text style={styles.queueType}>{item.zoneType}</Text>
                  {item.subZones && item.subZones.length > 0 && (
                    <View style={styles.subzones}>
                      {item.subZones.map(sz => (
                        <View key={sz.id} style={styles.subzonePill}>
                          <Text style={styles.subzoneName}>{sz.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.queueDuration}>
                  {formatTime(item.duration)}
                </Text>
                <TouchableOpacity
                  onPress={() => stopQueueItem(item.id)}
                  style={styles.removeBtn}>
                  <Icon name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {!!priorityQueue.length && !queuedItems.length && (
        <TouchableOpacity style={styles.stopAllFull} onPress={stopAll}>
          <Icon name="cancel" size={16} color={COLORS.error} />
          <Text style={styles.stopAllText}>Stop All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Queue;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  activeCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.card,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  activePulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  stopBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },
  activeZone: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activeType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.lg,
    textTransform: 'capitalize',
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  liveFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  liveFlowText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subzones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  subzonePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
  },
  subzoneName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stopAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stopAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  stopAllFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  queueList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  queueIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  queueInfo: {
    flex: 1,
  },
  queueZone: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  queueType: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  queueDuration: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  removeBtn: {
    padding: 4,
  },
});
