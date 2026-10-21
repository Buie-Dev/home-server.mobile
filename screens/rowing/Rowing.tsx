import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useRowing} from '../../hooks/useRowing.hook';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';
import type {
  Boat,
  BoatClass,
  Crew,
  CrewMember,
  CrewSeats,
  Gender,
  AgeCategory,
  Race,
  RaceType,
} from '../../api/rowing.api';

type RootStackParamList = {
  Rowing: undefined;
  RaceTimer: {raceId: number};
};

type RowingNavProp = NativeStackNavigationProp<RootStackParamList, 'Rowing'>;

type Tab = 'Races' | 'Crews' | 'Boats' | 'Members';

const TABS: Tab[] = ['Races', 'Crews', 'Boats', 'Members'];

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays({dateStr, delta}: {dateStr: string; delta: number}): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel({dateStr}: {dateStr: string}): string {
  const today = getTodayStr();
  if (dateStr === today) return 'Today';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function raceTypeBadgeColor({raceType}: {raceType: RaceType}): string {
  return raceType === 'time_trial' ? COLORS.primary : COLORS.warning;
}

function raceTypeBadgeLabel({raceType}: {raceType: RaceType}): string {
  return raceType === 'time_trial' ? 'Time Trial' : 'Side by Side';
}

function statusBadgeColor({status}: {status: string}): string {
  if (status === 'active') return COLORS.success;
  if (status === 'completed') return COLORS.textMuted;
  return COLORS.warning;
}

function statusBadgeLabel({status}: {status: string}): string {
  if (status === 'active') return 'Active';
  if (status === 'completed') return 'Completed';
  return 'Pending';
}

function formatElapsedMs({ms}: {ms: number}): string {
  const totalSec = Math.floor(ms / 10);
  const cs = ms % 100;
  const secs = Math.floor(totalSec / 100) % 60;
  const mins = Math.floor(totalSec / 6000);
  return `${mins}:${String(secs).padStart(2, '0')}.${String(cs).padStart(
    2,
    '0',
  )}`;
}

type CreateRaceModalProps = {
  visible: boolean;
  crews: Crew[];
  onClose: () => void;
  onSubmit: ({
    distance,
    raceType,
    crewIds,
    windConditions,
    notes,
  }: {
    distance: string;
    raceType: RaceType;
    crewIds: number[];
    windConditions?: string;
    notes?: string;
  }) => Promise<void>;
};

function CreateRaceModal({
  visible,
  crews,
  onClose,
  onSubmit,
}: CreateRaceModalProps): ReactElement {
  const [distance, setDistance] = useState('');
  const [raceType, setRaceType] = useState<RaceType>('time_trial');
  const [selectedCrewIds, setSelectedCrewIds] = useState<number[]>([]);
  const [wind, setWind] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setDistance('');
    setRaceType('time_trial');
    setSelectedCrewIds([]);
    setWind('');
    setNotes('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const toggleCrew = useCallback(({id}: {id: number}) => {
    setSelectedCrewIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!distance.trim()) {
      Alert.alert('Validation', 'Please enter a distance.');
      return;
    }
    if (selectedCrewIds.length === 0) {
      Alert.alert('Validation', 'Please select at least one crew.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        distance: distance.trim(),
        raceType,
        crewIds: selectedCrewIds,
        windConditions: wind.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      reset();
    } catch {
      Alert.alert('Error', 'Failed to create race.');
    } finally {
      setSubmitting(false);
    }
  }, [distance, raceType, selectedCrewIds, wind, notes, onSubmit, reset]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <Text style={styles.modalTitle}>New Race</Text>

          <TextInput
            style={styles.input}
            placeholder="Distance (m)"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            value={distance}
            onChangeText={setDistance}
          />

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                raceType === 'time_trial' && styles.toggleBtnActive,
              ]}
              onPress={() => setRaceType('time_trial')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  raceType === 'time_trial' && styles.toggleBtnTextActive,
                ]}>
                Time Trial
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                raceType === 'side_by_side' && styles.toggleBtnActive,
              ]}
              onPress={() => setRaceType('side_by_side')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  raceType === 'side_by_side' && styles.toggleBtnTextActive,
                ]}>
                Side by Side
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Select Crews</Text>
          <ScrollView style={styles.crewList} nestedScrollEnabled>
            {crews.map(crew => {
              const selected = selectedCrewIds.includes(crew.id);
              return (
                <TouchableOpacity
                  key={crew.id}
                  style={[
                    styles.crewCheckRow,
                    selected && styles.crewCheckRowSelected,
                  ]}
                  onPress={() => toggleCrew({id: crew.id})}>
                  <Icon
                    name={
                      selected ? 'checkbox-marked' : 'checkbox-blank-outline'
                    }
                    size={20}
                    color={selected ? COLORS.primary : COLORS.textMuted}
                  />
                  <View style={styles.crewCheckInfo}>
                    <Text style={styles.crewCheckName}>{crew.boatName}</Text>
                    {crew.crewClassName ? (
                      <Text style={styles.crewCheckSub}>
                        {crew.crewClassName}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
            {crews.length === 0 && (
              <Text style={styles.emptyNote}>
                No crews available. Create a crew first.
              </Text>
            )}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Wind conditions (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={wind}
            onChangeText={setWind}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Notes (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createBtn,
                (submitting || !distance.trim()) && styles.createBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || !distance.trim()}>
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <Text style={styles.createBtnText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

type CrewModalProps = {
  visible: boolean;
  boats: Boat[];
  boatClasses: BoatClass[];
  crewMembers: CrewMember[];
  editingCrew: Crew | null;
  onClose: () => void;
  onSubmit: ({
    boatId,
    gender,
    ageCategory,
    seats,
  }: {
    boatId: number;
    gender: Gender;
    ageCategory: AgeCategory;
    seats: CrewSeats;
  }) => Promise<void>;
};

type SeatKey = keyof CrewSeats;

const ALL_SEAT_KEYS: SeatKey[] = [
  'cox',
  'seat1',
  'seat2',
  'seat3',
  'seat4',
  'seat5',
  'seat6',
  'seat7',
  'seat8',
];

function seatLabel({
  key,
  crewCount,
}: {
  key: SeatKey;
  crewCount: number;
}): string {
  if (key === 'cox') return 'Cox';
  const num = parseInt(key.replace('seat', ''), 10);
  if (num === 1) return 'Stroke';
  if (num === crewCount) return 'Bow';
  return `Seat ${num}`;
}

function CrewModal({
  visible,
  boats,
  boatClasses,
  crewMembers,
  editingCrew,
  onClose,
  onSubmit,
}: CrewModalProps): ReactElement {
  const [boatId, setBoatId] = useState<number | null>(null);
  const [gender, setGender] = useState<Gender>('Mixed');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('Open');
  const [seats, setSeats] = useState<CrewSeats>({
    cox: null,
    seat1: null,
    seat2: null,
    seat3: null,
    seat4: null,
    seat5: null,
    seat6: null,
    seat7: null,
    seat8: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && editingCrew) {
      setBoatId(editingCrew.boatId);
      setGender(editingCrew.gender);
      setAgeCategory(editingCrew.ageCategory);
      setSeats({
        cox: editingCrew.cox?.crewMemberId ?? null,
        seat1: editingCrew.seat1?.crewMemberId ?? null,
        seat2: editingCrew.seat2?.crewMemberId ?? null,
        seat3: editingCrew.seat3?.crewMemberId ?? null,
        seat4: editingCrew.seat4?.crewMemberId ?? null,
        seat5: editingCrew.seat5?.crewMemberId ?? null,
        seat6: editingCrew.seat6?.crewMemberId ?? null,
        seat7: editingCrew.seat7?.crewMemberId ?? null,
        seat8: editingCrew.seat8?.crewMemberId ?? null,
      });
    } else if (visible && !editingCrew) {
      setBoatId(null);
      setGender('Mixed');
      setAgeCategory('Open');
      setSeats({
        cox: null,
        seat1: null,
        seat2: null,
        seat3: null,
        seat4: null,
        seat5: null,
        seat6: null,
        seat7: null,
        seat8: null,
      });
    }
  }, [visible, editingCrew]);

  const selectedBoat = boats.find(b => b.id === boatId) ?? null;
  const boatClass = selectedBoat
    ? boatClasses.find(bc => bc.id === selectedBoat.boatClassId) ?? null
    : null;
  const crewCount = boatClass?.crewCount ?? 2;
  const hasCox = boatClass?.hasCox ?? false;

  const activeSeatKeys = ALL_SEAT_KEYS.filter(k => {
    if (k === 'cox') return hasCox;
    const num = parseInt(k.replace('seat', ''), 10);
    return num <= crewCount;
  });

  const setSeat = useCallback(
    ({key, memberId}: {key: SeatKey; memberId: number | null}) => {
      setSeats(prev => ({...prev, [key]: memberId}));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!boatId) {
      Alert.alert('Validation', 'Please select a boat.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({boatId, gender, ageCategory, seats});
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save crew.');
    } finally {
      setSubmitting(false);
    }
  }, [boatId, gender, ageCategory, seats, onSubmit, onClose]);

  const GENDERS: Gender[] = ['Men', 'Women', 'Mixed'];
  const AGE_CATS: AgeCategory[] = ['Open', 'U19', 'U17', 'U15'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity
          style={[styles.modal, styles.modalLarge]}
          activeOpacity={1}>
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <Text style={styles.modalTitle}>
              {editingCrew ? 'Edit Crew' : 'New Crew'}
            </Text>

            <Text style={styles.sectionLabel}>Boat</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}>
              {boats.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.chip, boatId === b.id && styles.chipActive]}
                  onPress={() => setBoatId(b.id)}>
                  <Text
                    style={[
                      styles.chipText,
                      boatId === b.id && styles.chipTextActive,
                    ]}>
                    {b.name}
                    {b.boatClassSymbol ? ` (${b.boatClassSymbol})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Gender</Text>
            <View style={styles.toggleRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.toggleBtn,
                    gender === g && styles.toggleBtnActive,
                  ]}
                  onPress={() => setGender(g)}>
                  <Text
                    style={[
                      styles.toggleBtnText,
                      gender === g && styles.toggleBtnTextActive,
                    ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Age Category</Text>
            <View style={styles.toggleRow}>
              {AGE_CATS.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.toggleBtn,
                    ageCategory === cat && styles.toggleBtnActive,
                  ]}
                  onPress={() => setAgeCategory(cat)}>
                  <Text
                    style={[
                      styles.toggleBtnText,
                      ageCategory === cat && styles.toggleBtnTextActive,
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {boatId && (
              <>
                <Text style={styles.sectionLabel}>Seat Assignments</Text>
                {activeSeatKeys.map(key => (
                  <View key={key} style={styles.seatRow}>
                    <Text style={styles.seatLabel}>
                      {seatLabel({key, crewCount})}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.chipScroll}>
                      <TouchableOpacity
                        style={[
                          styles.chip,
                          seats[key] === null && styles.chipActive,
                        ]}
                        onPress={() => setSeat({key, memberId: null})}>
                        <Text
                          style={[
                            styles.chipText,
                            seats[key] === null && styles.chipTextActive,
                          ]}>
                          None
                        </Text>
                      </TouchableOpacity>
                      {crewMembers.map(m => (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.chip,
                            seats[key] === m.id && styles.chipActive,
                          ]}
                          onPress={() => setSeat({key, memberId: m.id})}>
                          <Text
                            style={[
                              styles.chipText,
                              seats[key] === m.id && styles.chipTextActive,
                            ]}>
                            {m.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </>
            )}

            <View style={[styles.modalActions, styles.modalActionsTop]}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  (!boatId || submitting) && styles.createBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!boatId || submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.createBtnText}>
                    {editingCrew ? 'Save' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

type CreateBoatModalProps = {
  visible: boolean;
  boatClasses: BoatClass[];
  onClose: () => void;
  onSubmit: ({
    name,
    boatClassId,
  }: {
    name: string;
    boatClassId?: number;
  }) => Promise<void>;
};

function CreateBoatModal({
  visible,
  boatClasses,
  onClose,
  onSubmit,
}: CreateBoatModalProps): ReactElement {
  const [name, setName] = useState('');
  const [boatClassId, setBoatClassId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setName('');
    setBoatClassId(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a boat name.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        boatClassId: boatClassId ?? undefined,
      });
      setName('');
      setBoatClassId(null);
    } catch {
      Alert.alert('Error', 'Failed to create boat.');
    } finally {
      setSubmitting(false);
    }
  }, [name, boatClassId, onSubmit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <Text style={styles.modalTitle}>New Boat</Text>

          <TextInput
            style={styles.input}
            placeholder="Boat name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.sectionLabel}>Class (optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.chip, boatClassId === null && styles.chipActive]}
              onPress={() => setBoatClassId(null)}>
              <Text
                style={[
                  styles.chipText,
                  boatClassId === null && styles.chipTextActive,
                ]}>
                None
              </Text>
            </TouchableOpacity>
            {boatClasses.map(bc => (
              <TouchableOpacity
                key={bc.id}
                style={[
                  styles.chip,
                  boatClassId === bc.id && styles.chipActive,
                ]}
                onPress={() => setBoatClassId(bc.id)}>
                <Text
                  style={[
                    styles.chipText,
                    boatClassId === bc.id && styles.chipTextActive,
                  ]}>
                  {bc.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createBtn,
                (!name.trim() || submitting) && styles.createBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <Text style={styles.createBtnText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

type CrewMemberModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: ({name, gender}: {name: string; gender: string}) => Promise<void>;
};

function CrewMemberModal({
  visible,
  onClose,
  onSubmit,
}: CrewMemberModalProps): ReactElement {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Men' | 'Women'>('Men');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setName('');
    setGender('Men');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a name.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({name: name.trim(), gender});
      setName('');
      setGender('Men');
    } catch {
      Alert.alert('Error', 'Failed to create member.');
    } finally {
      setSubmitting(false);
    }
  }, [name, gender, onSubmit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <Text style={styles.modalTitle}>New Member</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                gender === 'Men' && styles.toggleBtnActive,
              ]}
              onPress={() => setGender('Men')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  gender === 'Men' && styles.toggleBtnTextActive,
                ]}>
                Men
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                gender === 'Women' && styles.toggleBtnActive,
              ]}
              onPress={() => setGender('Women')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  gender === 'Women' && styles.toggleBtnTextActive,
                ]}>
                Women
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createBtn,
                (!name.trim() || submitting) && styles.createBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <Text style={styles.createBtnText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

type RaceCardProps = {
  race: Race;
  onPress: () => void;
  onLongPress: () => void;
};

function RaceCard({race, onPress, onLongPress}: RaceCardProps): ReactElement {
  const [rankBy, setRankBy] = useState<'time' | 'wbt'>('wbt');
  const typeColor = raceTypeBadgeColor({raceType: race.raceType});
  const typeLabel = raceTypeBadgeLabel({raceType: race.raceType});
  const stColor = statusBadgeColor({status: race.status});
  const stLabel = statusBadgeLabel({status: race.status});

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}>
      <View style={styles.cardTopRow}>
        <Text style={styles.raceDistance}>{race.distance}m</Text>
        <View style={[styles.badge, {backgroundColor: typeColor + '20'}]}>
          <Text style={[styles.badgeText, {color: typeColor}]}>
            {typeLabel}
          </Text>
        </View>
        <View style={[styles.badge, {backgroundColor: stColor + '20'}]}>
          <Text style={[styles.badgeText, {color: stColor}]}>{stLabel}</Text>
        </View>
        <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
      </View>

      {race.entries.length > 0 &&
        (() => {
          const finishedEntries = race.entries.filter(
            e => e.elapsedMs !== null && !e.dns && !e.dnf,
          );
          const otherEntries = race.entries.filter(
            e => e.elapsedMs === null || e.dns || e.dnf,
          );
          const hasWbt = finishedEntries.some(e => e.wbtPct !== null);
          const sortedFinished =
            rankBy === 'wbt' && hasWbt
              ? [...finishedEntries].sort(
                  (a, b) => (b.wbtPct ?? -1) - (a.wbtPct ?? -1),
                )
              : [...finishedEntries].sort(
                  (a, b) => (a.placement ?? 999) - (b.placement ?? 999),
                );
          return (
            <View style={styles.entryList}>
              {hasWbt && finishedEntries.length >= 2 && (
                <View style={styles.rankToggleRow}>
                  <Text style={styles.rankToggleLabel}>Rank by</Text>
                  <TouchableOpacity
                    style={[
                      styles.rankToggleBtn,
                      rankBy === 'time' && styles.rankToggleBtnActive,
                    ]}
                    onPress={() => setRankBy('time')}>
                    <Text
                      style={[
                        styles.rankToggleBtnText,
                        rankBy === 'time' && styles.rankToggleBtnTextActive,
                      ]}>
                      Time
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.rankToggleBtn,
                      rankBy === 'wbt' && styles.rankToggleBtnActive,
                    ]}
                    onPress={() => setRankBy('wbt')}>
                    <Text
                      style={[
                        styles.rankToggleBtnText,
                        rankBy === 'wbt' && styles.rankToggleBtnTextActive,
                      ]}>
                      WBT%
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {[...sortedFinished, ...otherEntries].map(entry => (
                <View key={entry.id} style={styles.entryRow}>
                  <Icon name="rowing" size={13} color={COLORS.textMuted} />
                  <Text style={styles.entryBoat}>{entry.boatName}</Text>
                  {entry.keyPerson ? (
                    <Text style={styles.entryKey}>{entry.keyPerson}</Text>
                  ) : null}
                  {entry.elapsedMs !== null && (
                    <View style={styles.entryTimeBlock}>
                      <Text style={styles.entryTime}>
                        {formatElapsedMs({ms: entry.elapsedMs})}
                      </Text>
                      {entry.wbtPct !== null && (
                        <Text style={styles.wbtBadge}>
                          {entry.wbtPct.toFixed(1)}% WBT
                          {entry.wbtIsEstimated ? '*' : ''}
                        </Text>
                      )}
                    </View>
                  )}
                  {entry.dns && <Text style={styles.dnsBadgeSmall}>DNS</Text>}
                  {entry.dnf && <Text style={styles.dnfBadgeSmall}>DNF</Text>}
                </View>
              ))}
            </View>
          );
        })()}
    </TouchableOpacity>
  );
}

function Rowing(): ReactElement {
  const navigation = useNavigation<RowingNavProp>();
  const today = getTodayStr();
  const [activeTab, setActiveTab] = useState<Tab>('Races');
  const [date, setDate] = useState(today);
  const [showCreateRace, setShowCreateRace] = useState(false);
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [showBoatModal, setShowBoatModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const {
    boatClasses,
    crewMembers,
    boats,
    crews,
    races,
    isLoading,
    fetchAllBoatClasses,
    fetchAllCrew,
    addCrewMember,
    removeCrewMember,
    fetchAllBoats,
    addBoat,
    removeBoat,
    fetchAllCrews,
    addCrew,
    editCrew,
    removeCrew,
    fetchAllRaces,
    startRace,
    removeRace,
  } = useRowing();

  const loadInitial = useCallback(async () => {
    await Promise.all([
      fetchAllBoatClasses(),
      fetchAllCrew(),
      fetchAllBoats(),
      fetchAllCrews(),
    ]);
  }, [fetchAllBoatClasses, fetchAllCrew, fetchAllBoats, fetchAllCrews]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    fetchAllRaces({date});
  }, [date, fetchAllRaces]);

  const handlePrevDay = useCallback(() => {
    setDate(d => addDays({dateStr: d, delta: -1}));
  }, []);

  const handleNextDay = useCallback(() => {
    setDate(d => addDays({dateStr: d, delta: 1}));
  }, []);

  const handleCreateRace = useCallback(
    async ({
      distance,
      raceType,
      crewIds,
      windConditions,
      notes,
    }: {
      distance: string;
      raceType: RaceType;
      crewIds: number[];
      windConditions?: string;
      notes?: string;
    }) => {
      const raceId = await startRace({
        distance,
        raceType,
        crewIds,
        windConditions,
        notes,
      });
      setShowCreateRace(false);
      navigation.navigate('RaceTimer', {raceId});
    },
    [startRace, navigation],
  );

  const handleDeleteRace = useCallback(
    ({race}: {race: Race}) => {
      Alert.alert(
        'Delete Race',
        `Delete ${race.distance}m race? This cannot be undone.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeRace({id: race.id, date});
              } catch {
                Alert.alert('Error', 'Failed to delete race.');
              }
            },
          },
        ],
      );
    },
    [removeRace, date],
  );

  const handleCreateCrew = useCallback(
    async ({
      boatId,
      gender,
      ageCategory,
      seats,
    }: {
      boatId: number;
      gender: Gender;
      ageCategory: AgeCategory;
      seats: CrewSeats;
    }) => {
      if (editingCrew) {
        await editCrew({
          id: editingCrew.id,
          boatId,
          gender,
          ageCategory,
          ...seats,
        });
      } else {
        await addCrew({boatId, gender, ageCategory, ...seats});
      }
      setEditingCrew(null);
      setShowCrewModal(false);
    },
    [editingCrew, editCrew, addCrew],
  );

  const handleDeleteCrew = useCallback(
    ({crew}: {crew: Crew}) => {
      Alert.alert('Delete Crew', `Delete crew for ${crew.boatName}?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCrew({id: crew.id});
            } catch {
              Alert.alert('Error', 'Failed to delete crew.');
            }
          },
        },
      ]);
    },
    [removeCrew],
  );

  const handleDeleteBoat = useCallback(
    ({boat}: {boat: Boat}) => {
      Alert.alert('Delete Boat', `Delete "${boat.name}"?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBoat({id: boat.id});
            } catch {
              Alert.alert('Error', 'Failed to delete boat.');
            }
          },
        },
      ]);
    },
    [removeBoat],
  );

  const handleDeleteMember = useCallback(
    ({member}: {member: CrewMember}) => {
      Alert.alert('Delete Member', `Delete "${member.name}"?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCrewMember({id: member.id});
            } catch {
              Alert.alert('Error', 'Failed to delete member.');
            }
          },
        },
      ]);
    },
    [removeCrewMember],
  );

  const renderRacesTab = (): ReactElement => (
    <View style={styles.tabContent}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : races.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="flag-checkered" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No races on this day</Text>
        </View>
      ) : (
        races.map(race => (
          <RaceCard
            key={race.id}
            race={race}
            onPress={() => navigation.navigate('RaceTimer', {raceId: race.id})}
            onLongPress={() => handleDeleteRace({race})}
          />
        ))
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateRace(true)}>
        <Icon name="plus" size={24} color={COLORS.surface} />
        <Text style={styles.fabText}>New Race</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCrewsTab = (): ReactElement => (
    <View style={styles.tabContent}>
      {crews.length === 0 ? (
        <View style={styles.centered}>
          <Icon
            name="account-group-outline"
            size={40}
            color={COLORS.textMuted}
          />
          <Text style={styles.emptyText}>No crews yet</Text>
        </View>
      ) : (
        crews.map(crew => {
          const keyPerson = crew.cox?.name ?? crew.seat1?.name ?? null;
          return (
            <View key={crew.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardTitleGroup}>
                  <Text style={styles.cardTitle}>{crew.boatName}</Text>
                  {crew.crewClassName ? (
                    <Text style={styles.cardSub}>{crew.crewClassName}</Text>
                  ) : null}
                  {keyPerson ? (
                    <Text style={styles.cardSub}>
                      {crew.boatClassHasCox ? 'Cox' : 'Stroke'}: {keyPerson}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => {
                    setEditingCrew(crew);
                    setShowCrewModal(true);
                  }}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon
                    name="pencil-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDeleteCrew({crew})}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon name="delete-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingCrew(null);
          setShowCrewModal(true);
        }}>
        <Icon name="plus" size={24} color={COLORS.surface} />
        <Text style={styles.fabText}>New Crew</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBoatsTab = (): ReactElement => (
    <View style={styles.tabContent}>
      {boats.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="sail-boat-sink" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No boats yet</Text>
        </View>
      ) : (
        boats.map(boat => (
          <View key={boat.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardTitleGroup}>
                <Text style={styles.cardTitle}>{boat.name}</Text>
                {boat.boatClassSymbol ? (
                  <Text style={styles.cardSub}>{boat.boatClassSymbol}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handleDeleteBoat({boat})}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon name="delete-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowBoatModal(true)}>
        <Icon name="plus" size={24} color={COLORS.surface} />
        <Text style={styles.fabText}>New Boat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMembersTab = (): ReactElement => (
    <View style={styles.tabContent}>
      {crewMembers.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="account-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No members yet</Text>
        </View>
      ) : (
        crewMembers.map(member => (
          <View key={member.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{member.name}</Text>
              <View style={[styles.badge, styles.genderBadge]}>
                <Text style={styles.genderBadgeText}>{member.gender}</Text>
              </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handleDeleteMember({member})}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon name="delete-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowMemberModal(true)}>
        <Icon name="plus" size={24} color={COLORS.surface} />
        <Text style={styles.fabText}>New Member</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="arrow-left" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rowing</Text>
      </View>

      <View style={styles.dateBar}>
        <TouchableOpacity
          onPress={handlePrevDay}
          style={styles.dateNavBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.dateLabel}>{formatDateLabel({dateStr: date})}</Text>
        <TouchableOpacity
          onPress={handleNextDay}
          style={styles.dateNavBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="chevron-right" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === tab && styles.tabBtnTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}>
        {activeTab === 'Races' && renderRacesTab()}
        {activeTab === 'Crews' && renderCrewsTab()}
        {activeTab === 'Boats' && renderBoatsTab()}
        {activeTab === 'Members' && renderMembersTab()}
      </ScrollView>

      <CreateRaceModal
        visible={showCreateRace}
        crews={crews}
        onClose={() => setShowCreateRace(false)}
        onSubmit={handleCreateRace}
      />

      <CrewModal
        visible={showCrewModal}
        boats={boats}
        boatClasses={boatClasses}
        crewMembers={crewMembers}
        editingCrew={editingCrew}
        onClose={() => {
          setShowCrewModal(false);
          setEditingCrew(null);
        }}
        onSubmit={handleCreateCrew}
      />

      <CreateBoatModal
        visible={showBoatModal}
        boatClasses={boatClasses}
        onClose={() => setShowBoatModal(false)}
        onSubmit={addBoat}
      />

      <CrewMemberModal
        visible={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSubmit={addCrewMember}
      />
    </SafeAreaView>
  );
}

export default Rowing;

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
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateNavBtn: {
    padding: SPACING.xs,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBarContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  tabBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tabContent: {
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitleGroup: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  iconBtn: {
    padding: SPACING.xs,
  },
  raceDistance: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  genderBadge: {
    backgroundColor: COLORS.primaryLight,
  },
  genderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  entryList: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  rankToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  rankToggleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  rankToggleBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankToggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rankToggleBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rankToggleBtnTextActive: {
    color: COLORS.surface,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  entryBoat: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  entryKey: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  entryTimeBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  entryTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    fontVariant: ['tabular-nums'],
  },
  wbtBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  dnsBadgeSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  dnfBadgeSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.warning,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    ...SHADOWS.card,
  },
  fabText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  modalLarge: {
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleBtnTextActive: {
    color: COLORS.primary,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  crewList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  crewCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  crewCheckRowSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  crewCheckInfo: {
    flex: 1,
  },
  crewCheckName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  crewCheckSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyNote: {
    padding: SPACING.md,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  seatRow: {
    gap: SPACING.xs,
  },
  seatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  modalActionsTop: {
    marginTop: SPACING.md,
  },
  cancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  createBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
  },
  warningLight: {
    backgroundColor: COLORS.warningLight,
  },
});
