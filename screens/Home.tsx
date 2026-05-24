import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../lib/theme';
import type { RootStackParamList } from '../App';

type Section = {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  route: keyof RootStackParamList;
};

const SECTIONS: Section[] = [
  {
    title: 'Irrigation',
    icon: 'sprinkler-variant',
    iconBg: COLORS.primaryLight,
    iconColor: COLORS.primary,
    route: 'Irrigation',
  },
  {
    title: 'Megan',
    icon: 'flower-outline',
    iconBg: '#FCE4EC',
    iconColor: '#E91E63',
    route: 'Megan',
  },
  {
    title: 'To Do',
    icon: 'format-list-checks',
    iconBg: COLORS.warningLight,
    iconColor: COLORS.warning,
    route: 'ToDo',
  },
];

function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>HomeApp</Text>
        {SECTIONS.map(section => (
          <TouchableOpacity
            key={section.title}
            style={styles.card}
            onPress={() => navigation.navigate(section.route as any)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: section.iconBg }]}>
              <Icon name={section.icon} size={28} color={section.iconColor} />
            </View>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Icon name="chevron-right" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
