import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Zones from '../../screens/irrigation/Zones';
import Schedules from '../../screens/irrigation/Schedules';
import Queue from '../../screens/irrigation/Queue';
import History from '../../screens/irrigation/History';
import Devices from '../../screens/irrigation/Devices';
import useIrrigation from '../../hooks/useIrrigation.hook';
import { COLORS } from '../../lib/theme';

const Tab = createBottomTabNavigator();

const PageHeader = ({ title, icon }: { title: string; icon: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <View style={styles.headerIconWrap}>
        <Icon name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.getParent()?.goBack()} style={styles.homeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Icon name="home-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const TAB_ICONS: Record<string, string> = {
  Zones: 'sprinkler-variant',
  Schedules: 'calendar-clock',
  Live: 'play-circle-outline',
  History: 'chart-bar',
  Devices: 'access-point-network',
};

const IrrigationPage = () => {
  const { priorityQueue } = useIrrigation();

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
          screenOptions={({ route }) => ({
            header: () => <PageHeader title={route.name} icon={TAB_ICONS[route.name] ?? 'circle'} />,
            tabBarIcon: ({ color, size }) => (
              <Icon name={TAB_ICONS[route.name] ?? 'circle'} size={size} color={color} />
            ),
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
          })}
        >
          <Tab.Screen name="Zones" component={Zones} />
          <Tab.Screen name="Schedules" component={Schedules} />
          <Tab.Screen
            name="Live"
            component={Queue}
            options={{
              tabBarBadge: priorityQueue.length > 0 ? priorityQueue.length : undefined,
            }}
          />
          <Tab.Screen name="History" component={History} />
          <Tab.Screen name="Devices" component={Devices} />
        </Tab.Navigator>
    </SafeAreaView>
  );
};

export default IrrigationPage;

const styles = StyleSheet.create({
  container: {
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
  homeBtn: {
    marginLeft: 'auto',
    padding: 4,
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
