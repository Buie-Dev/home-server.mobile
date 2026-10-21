import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ZoneDetail} from '../../hooks/useIrrigation.hook';
import {COLORS, SPACING} from '../../lib/theme';

type Props = {
  zoneDetails: ZoneDetail[];
  onChange: (zoneId?: number, subzoneId?: number) => void;
};

const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

function ZoneFilterBar({zoneDetails, onChange}: Props) {
  const [selectedZone, setSelectedZone] = useState<ZoneDetail | null>(null);
  const [selectedSubzoneId, setSelectedSubzoneId] = useState<number | null>(
    null,
  );

  if (zoneDetails.length === 0) return null;

  const groupedZones = zoneDetails.reduce<Record<string, ZoneDetail[]>>(
    (acc, zone) => {
      (acc[zone.type] = acc[zone.type] ?? []).push(zone);
      return acc;
    },
    {},
  );

  const subzoneOptions = selectedZone?.subzones ?? [];

  const selectZone = (zone: ZoneDetail) => {
    const next = selectedZone?.id === zone.id ? null : zone;
    setSelectedZone(next);
    setSelectedSubzoneId(null);
    onChange(next?.id, undefined);
  };

  const selectSubzone = (id: number) => {
    const next = selectedSubzoneId === id ? null : id;
    setSelectedSubzoneId(next);
    onChange(selectedZone?.id, next ?? undefined);
  };

  const clearAll = () => {
    setSelectedZone(null);
    setSelectedSubzoneId(null);
    onChange(undefined, undefined);
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[null, ...Object.entries(groupedZones)]}
        keyExtractor={(_, i) => String(i)}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
        renderItem={({item}) => {
          if (item === null) {
            return (
              <View style={styles.groupAllWrap}>
                <FilterChip
                  label="All"
                  active={!selectedZone}
                  onPress={clearAll}
                />
              </View>
            );
          }
          const [type, zones] = item as [string, ZoneDetail[]];
          return (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>{type}</Text>
              <View style={styles.groupChips}>
                {zones.map(zone => (
                  <FilterChip
                    key={zone.id}
                    label={zone.name}
                    active={selectedZone?.id === zone.id}
                    onPress={() => selectZone(zone)}
                  />
                ))}
              </View>
            </View>
          );
        }}
      />
      {subzoneOptions.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...subzoneOptions]}
          keyExtractor={(_, i) => String(i)}
          style={[styles.row, styles.rowBorder]}
          contentContainerStyle={styles.rowContent}
          renderItem={({item}) => {
            if (item === null) {
              return (
                <FilterChip
                  label="All"
                  active={!selectedSubzoneId}
                  onPress={() => {
                    setSelectedSubzoneId(null);
                    onChange(selectedZone?.id, undefined);
                  }}
                />
              );
            }
            const sz = item as (typeof subzoneOptions)[0];
            return (
              <FilterChip
                key={sz.id}
                label={sz.name}
                active={selectedSubzoneId === sz.id}
                onPress={() => selectSubzone(sz.id)}
              />
            );
          }}
        />
      )}
    </View>
  );
}

export default ZoneFilterBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {maxHeight: 64},
  rowBorder: {borderTopWidth: 1, borderTopColor: COLORS.border},
  rowContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  group: {alignItems: 'flex-start'},
  groupAllWrap: {justifyContent: 'flex-end', alignSelf: 'stretch'},
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  groupChips: {flexDirection: 'row', gap: SPACING.xs},
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  chipText: {fontSize: 13, fontWeight: '500', color: COLORS.textSecondary},
  chipTextActive: {color: COLORS.surface},
});
