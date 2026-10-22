import React, {ReactElement, useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useIrrigation, {Zone} from '../../hooks/useIrrigation.hook';
import ManualIrrigationModal from '../../components/ManualIrrigationModal/ManualIrrigationModal';
import ZonesFilter, {
  FilterItem,
} from '../../components/ZonesFilter/ZonesFilter';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';
import {formatTime} from '../../lib/datetime';

const ZONE_ICONS: Record<string, string> = {
  garden: 'flower-outline',
  lawn: 'grass',
  drip: 'water-circle',
  patio: 'home-outline',
  shrub: 'tree-outline',
};

const getZoneIcon = (type: string) =>
  ZONE_ICONS[type?.toLowerCase()] ?? 'sprinkler-variant';

function Zones(): ReactElement {
  const {fetchZones, zones, priorityQueue, fetchZoneTypes, zoneTypes} =
    useIrrigation();
  const [selectedZone, setSelectedZone] = useState<Zone>();
  const [selectedFilter, setSelectedFilter] = useState<
    FilterItem | undefined
  >();

  useEffect(() => {
    fetchZones(selectedFilter?.id);
  }, [selectedFilter]);

  useEffect(() => {
    fetchZoneTypes();
  }, []);

  const getZoneStatus = (z: Zone) => {
    if (z.state) {return 'active';}
    const inQueue = priorityQueue.find(pq => pq.zone === z.zone);
    if (inQueue) {return 'queued';}
    return 'idle';
  };

  const getQueuedItem = (z: Zone) =>
    priorityQueue.find(pq => pq.zone === z.zone);

  const STATUS_STYLE = {
    active: {
      bg: COLORS.successLight,
      border: COLORS.success,
      label: 'Active',
      labelColor: COLORS.success,
    },
    queued: {
      bg: COLORS.warningLight,
      border: COLORS.warning,
      label: 'Queued',
      labelColor: COLORS.warning,
    },
    idle: {
      bg: COLORS.surface,
      border: COLORS.border,
      label: '',
      labelColor: COLORS.textMuted,
    },
  };

  return (
    <View style={styles.screen}>
      <ZonesFilter
        items={zoneTypes.map(zt => ({id: zt.id, label: zt.type}))}
        selected={selectedFilter}
        onSelect={setSelectedFilter}
      />

      <ScrollView contentContainerStyle={styles.list}>
        {zones.map((z: Zone) => {
          const status = getZoneStatus(z);
          const cfg = STATUS_STYLE[status];
          const queueItem = getQueuedItem(z);

          return (
            <TouchableOpacity
              key={z.id}
              style={[
                styles.card,
                {backgroundColor: cfg.bg, borderColor: cfg.border},
              ]}
              onPress={() => setSelectedZone(z)}
              activeOpacity={0.75}>
              <View
                style={[styles.iconWrap, {backgroundColor: cfg.border + '22'}]}>
                <Icon
                  name={getZoneIcon(z.type)}
                  size={24}
                  color={
                    cfg.border === COLORS.border
                      ? COLORS.textSecondary
                      : cfg.border
                  }
                />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.zoneName}>{z.name}</Text>
                <Text style={styles.zoneType}>{z.type}</Text>
                <Text style={styles.zoneId}>Zone #{z.zone}</Text>
              </View>

              <View style={styles.cardRight}>
                {status !== 'idle' && (
                  <View style={[styles.badge, {backgroundColor: cfg.border}]}>
                    <Text style={styles.badgeText}>{cfg.label}</Text>
                  </View>
                )}
                {queueItem && (
                  <Text style={styles.queueTimer}>
                    {formatTime(queueItem.duration)}
                  </Text>
                )}
                <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}

        {zones.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="sprinkler-variant" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No zones found</Text>
          </View>
        )}
      </ScrollView>

      <ManualIrrigationModal
        open={!!selectedZone}
        zone={selectedZone}
        onClose={() => setSelectedZone(undefined)}
      />
    </View>
  );
}

export default Zones;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  zoneType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  zoneId: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queueTimer: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
