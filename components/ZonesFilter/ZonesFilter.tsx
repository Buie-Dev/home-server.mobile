import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {COLORS, RADIUS, SPACING} from '../../lib/theme';

export type FilterItem = {
  id: number;
  label: string;
  sublabel?: string; // parent zone name shown beneath subzone chips
  itemType?: string; // e.g. 'zone' | 'subzone' — used to distinguish same-id items
};

type Props = {
  items: FilterItem[];
  selected: FilterItem | undefined; // undefined = "All"
  onSelect: (item: FilterItem | undefined) => void;
};

const isActive = (item: FilterItem, selected: FilterItem | undefined) =>
  !!selected && selected.id === item.id && selected.itemType === item.itemType;

function ZonesFilter({items, selected, onSelect}: Props) {
  const all: FilterItem = {id: 0, label: 'All'};
  const chips = [all, ...items];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}>
      {chips.map((item, index) => {
        const active =
          item.id === 0 ? selected === undefined : isActive(item, selected);
        return (
          <TouchableOpacity
            key={`${item.itemType ?? 'all'}-${item.id}-${index}`}
            style={[
              styles.chip,
              item.sublabel && styles.chipTall,
              active && styles.chipActive,
            ]}
            onPress={() => onSelect(item.id === 0 ? undefined : item)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {item.label}
            </Text>
            {item.sublabel && (
              <Text
                style={[
                  styles.chipSublabel,
                  active && styles.chipSublabelActive,
                ]}>
                {item.sublabel}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default ZonesFilter;

const styles = StyleSheet.create({
  bar: {
    maxHeight: 64,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipTall: {
    height: 48,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.surface,
  },
  chipSublabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  chipSublabelActive: {
    color: COLORS.surface,
    opacity: 0.8,
  },
});
