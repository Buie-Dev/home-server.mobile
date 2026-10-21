import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import useDevices, {DeviceWithStatus} from '../../hooks/useDevices.hook';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';

const STATUS_CONFIG = {
  online: {
    color: COLORS.success,
    bg: COLORS.successLight,
    icon: 'check-circle',
    label: 'Online',
  },
  offline: {
    color: COLORS.error,
    bg: COLORS.errorLight,
    icon: 'close-circle',
    label: 'Offline',
  },
  checking: {
    color: COLORS.textMuted,
    bg: COLORS.divider,
    icon: 'help-circle',
    label: 'Checking',
  },
} as const;

const formatResponseTime = (ms?: number) =>
  ms !== undefined ? `${ms}ms` : null;

const formatLastChecked = (date: Date | null) => {
  if (!date) return 'Never checked';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
};

const DeviceCard = ({device}: {device: DeviceWithStatus}) => {
  const cfg = STATUS_CONFIG[device.status];
  return (
    <View style={styles.card}>
      <View style={[styles.statusStripe, {backgroundColor: cfg.color}]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceDesc}>{device.description}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: cfg.bg}]}>
            <Icon name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statusLabel, {color: cfg.color}]}>
              {cfg.label}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.lastChecked}>
            {formatLastChecked(device.lastChecked)}
          </Text>
          {formatResponseTime(device.responseTimeMs) && (
            <Text style={styles.responseTime}>
              {formatResponseTime(device.responseTimeMs)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

function Devices() {
  const navigation = useNavigation();
  const {devices, fetchDevices, checkConnectivity, loading} = useDevices();

  useEffect(() => {
    fetchDevices();
  }, []);
  useEffect(() => {
    if (devices.length > 0) checkConnectivity();
  }, [devices.length]);

  const onlineCount = devices.filter(d => d.status === 'online').length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon name="access-point-network" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Devices</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.homeBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="home-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {/* Summary bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{devices.length}</Text>
            <Text style={styles.summaryLabel}>Devices</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, {color: COLORS.success}]}>
              {onlineCount}
            </Text>
            <Text style={styles.summaryLabel}>Online</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    devices.length - onlineCount > 0
                      ? COLORS.error
                      : COLORS.textMuted,
                },
              ]}>
              {devices.length - onlineCount}
            </Text>
            <Text style={styles.summaryLabel}>Offline</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={fetchDevices}
            disabled={loading}>
            <Icon name="download-outline" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Refresh List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={checkConnectivity}
            disabled={loading || devices.length === 0}>
            <Icon
              name="access-point-network"
              size={16}
              color={COLORS.surface}
            />
            <Text style={[styles.actionText, {color: COLORS.surface}]}>
              Check Connectivity
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        )}

        {!loading && devices.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="devices" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No devices registered</Text>
            <Text style={styles.emptySub}>
              Devices will appear here once registered in the API
            </Text>
          </View>
        )}

        {devices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default Devices;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  homeBtn: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loader: {
    marginTop: SPACING.xl,
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
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  statusStripe: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deviceDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  lastChecked: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  responseTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
