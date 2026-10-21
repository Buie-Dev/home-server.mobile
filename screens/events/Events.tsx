import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import useEvents, {
  CalendarEvent,
  EventCategory,
} from '../../hooks/useEvents.hook';
import ManageCategoriesModal, {
  CategoryForManage,
} from '../../components/ManageCategoriesModal/ManageCategoriesModal';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';

const CATEGORY_COLORS = [
  '#2196F3',
  '#4CAF50',
  '#E91E63',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#F44336',
  '#607D8B',
  '#795548',
  '#3F51B5',
];

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getCategoryColor = ({index}: {index: number}) =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length];

const formatDate = ({dateStr}: {dateStr: string}) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = ({timeStr}: {timeStr: string}) => {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const toDateString = ({date}: {date: Date}) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

const toTimeString = ({date}: {date: Date}) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;

const todayStr = () => toDateString({date: new Date()});

type Section = {title: string; data: CalendarEvent[]};

const groupByDate = ({events}: {events: CalendarEvent[]}): Section[] => {
  const sorted = [...events].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.time ?? '').localeCompare(b.time ?? '');
  });
  const groups: Record<string, CalendarEvent[]> = {};
  for (const ev of sorted) {
    if (!groups[ev.date]) groups[ev.date] = [];
    groups[ev.date].push(ev);
  }
  return Object.entries(groups).map(([date, data]) => ({
    title: formatDate({dateStr: date}),
    data,
  }));
};

// ── Picker Modal ──────────────────────────────────────────────────────────────

type PickerOption = {id: number; name: string};

type PickerModalProps = {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: number | null;
  nullable?: boolean;
  onSelect: ({id}: {id: number | null}) => void;
  onClose: () => void;
};

function PickerModal({
  visible,
  title,
  options,
  selectedId,
  nullable,
  onSelect,
  onClose,
}: PickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={picker.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={picker.sheet}>
          <Text style={picker.title}>{title}</Text>
          {nullable && (
            <TouchableOpacity
              style={picker.item}
              onPress={() => {
                onSelect({id: null});
                onClose();
              }}>
              <Text style={[picker.itemText, {color: COLORS.textMuted}]}>
                None
              </Text>
            </TouchableOpacity>
          )}
          {options.map(o => (
            <TouchableOpacity
              key={o.id}
              style={[picker.item, o.id === selectedId && picker.itemActive]}
              onPress={() => {
                onSelect({id: o.id});
                onClose();
              }}>
              <Text
                style={[
                  picker.itemText,
                  o.id === selectedId && {color: COLORS.primary},
                ]}>
                {o.name}
              </Text>
              {o.id === selectedId && (
                <Icon name="check" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
          {options.length === 0 && (
            <Text style={picker.empty}>No options available</Text>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const picker = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    maxHeight: '70%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemActive: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  itemText: {fontSize: 15, color: COLORS.textPrimary},
  empty: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
});

// ── Add/Edit Modal ────────────────────────────────────────────────────────────

type AddEditModalProps = {
  visible: boolean;
  event: CalendarEvent | null;
  defaultDate?: string;
  categories: EventCategory[];
  onSave: ({
    data,
  }: {
    data: {
      title: string;
      description?: string;
      date: string;
      time?: string;
      categoryId: number;
      subcategoryId?: number;
    };
  }) => Promise<void>;
  onClose: () => void;
};

function AddEditEventModal({
  visible,
  event,
  defaultDate,
  categories,
  onSave,
  onClose,
}: AddEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Date | null>(null);
  const [hasTime, setHasTime] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      const [y, mo, d] = event.date.split('-').map(Number);
      setDate(new Date(y, mo - 1, d));
      if (event.time) {
        const [h, m] = event.time.split(':').map(Number);
        const t = new Date();
        t.setHours(h, m, 0, 0);
        setTime(t);
        setHasTime(true);
      } else {
        setTime(null);
        setHasTime(false);
      }
      setCategoryId(event.categoryId);
      setSubcategoryId(event.subcategoryId ?? null);
    } else {
      setTitle('');
      setDescription('');
      if (defaultDate) {
        const [y, mo, d] = defaultDate.split('-').map(Number);
        setDate(new Date(y, mo - 1, d));
      } else {
        setDate(new Date());
      }
      setTime(null);
      setHasTime(false);
      setCategoryId(categories[0]?.id ?? null);
      setSubcategoryId(null);
    }
  }, [visible, event]);

  const selectedCategory = categories.find(c => c.id === categoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an event title.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Required', 'Please select a category.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          date: toDateString({date}),
          time: hasTime && time ? toTimeString({date: time}) : undefined,
          categoryId,
          subcategoryId: subcategoryId ?? undefined,
        },
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={modal.sheet}>
          <View style={modal.headerRow}>
            <Text style={modal.heading}>
              {event ? 'Edit Event' : 'Add Event'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text style={modal.label}>Title *</Text>
            <TextInput
              style={modal.input}
              placeholder="Event title"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={modal.label}>Date *</Text>
            <TouchableOpacity
              style={modal.inputBtn}
              onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar" size={16} color={COLORS.primary} />
              <Text style={modal.inputBtnText}>
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  if (Platform.OS !== 'ios') setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <TouchableOpacity
                style={modal.doneBtn}
                onPress={() => setShowDatePicker(false)}>
                <Text style={modal.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}

            <View style={modal.rowBetween}>
              <Text style={modal.label}>Time</Text>
              <TouchableOpacity
                onPress={() => {
                  setHasTime(!hasTime);
                  if (!hasTime && !time) {
                    const t = new Date();
                    t.setSeconds(0, 0);
                    setTime(t);
                  }
                }}>
                <Text
                  style={[
                    modal.toggleText,
                    {color: hasTime ? COLORS.primary : COLORS.textMuted},
                  ]}>
                  {hasTime ? 'Remove' : 'Add time'}
                </Text>
              </TouchableOpacity>
            </View>
            {hasTime && (
              <>
                <TouchableOpacity
                  style={modal.inputBtn}
                  onPress={() => setShowTimePicker(true)}>
                  <Icon name="clock-outline" size={16} color={COLORS.primary} />
                  <Text style={modal.inputBtnText}>
                    {time
                      ? formatTime({timeStr: toTimeString({date: time})})
                      : 'Select time'}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={time ?? new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selected) => {
                      if (Platform.OS !== 'ios') setShowTimePicker(false);
                      if (selected) setTime(selected);
                    }}
                  />
                )}
                {Platform.OS === 'ios' && showTimePicker && (
                  <TouchableOpacity
                    style={modal.doneBtn}
                    onPress={() => setShowTimePicker(false)}>
                    <Text style={modal.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <Text style={modal.label}>Category *</Text>
            <TouchableOpacity
              style={modal.inputBtn}
              onPress={() => setShowCategoryPicker(true)}>
              <Icon name="tag-outline" size={16} color={COLORS.primary} />
              <Text
                style={[
                  modal.inputBtnText,
                  !selectedCategory && {color: COLORS.textMuted},
                ]}>
                {selectedCategory?.name ?? 'Select category'}
              </Text>
              <Icon name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <PickerModal
              visible={showCategoryPicker}
              title="Select Category"
              options={categories}
              selectedId={categoryId}
              onSelect={({id}) => {
                setCategoryId(id);
                setSubcategoryId(null);
              }}
              onClose={() => setShowCategoryPicker(false)}
            />

            {subcategories.length > 0 && (
              <>
                <Text style={modal.label}>Subcategory</Text>
                <TouchableOpacity
                  style={modal.inputBtn}
                  onPress={() => setShowSubcategoryPicker(true)}>
                  <Icon
                    name="tag-multiple-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text
                    style={[
                      modal.inputBtnText,
                      !subcategoryId && {color: COLORS.textMuted},
                    ]}>
                    {subcategories.find(s => s.id === subcategoryId)?.name ??
                      'Select subcategory (optional)'}
                  </Text>
                  <Icon
                    name="chevron-down"
                    size={16}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
                <PickerModal
                  visible={showSubcategoryPicker}
                  title="Select Subcategory"
                  options={subcategories}
                  selectedId={subcategoryId}
                  nullable
                  onSelect={({id}) => setSubcategoryId(id)}
                  onClose={() => setShowSubcategoryPicker(false)}
                />
              </>
            )}

            <Text style={modal.label}>Description</Text>
            <TextInput
              style={[modal.input, modal.textArea]}
              placeholder="Optional notes"
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <View style={modal.btnRow}>
              <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.saveBtn, saving && {opacity: 0.6}]}
                onPress={handleSave}
                disabled={saving}>
                <Text style={modal.saveText}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.md,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  heading: {fontSize: 20, fontWeight: '700', color: COLORS.textPrimary},
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {minHeight: 80, textAlignVertical: 'top'},
  inputBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputBtnText: {flex: 1, fontSize: 15, color: COLORS.textPrimary},
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {fontSize: 13, fontWeight: '600'},
  doneBtn: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  doneBtnText: {fontSize: 15, fontWeight: '600', color: COLORS.primary},
  btnRow: {flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg},
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {fontSize: 15, fontWeight: '600', color: COLORS.textSecondary},
  saveBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveText: {fontSize: 15, fontWeight: '600', color: COLORS.surface},
});

// ── Calendar View ─────────────────────────────────────────────────────────────

type CalendarViewProps = {
  events: CalendarEvent[];
  categoryColorMap: Record<number, string>;
  onSelectDate: ({dateStr}: {dateStr: string}) => void;
  onEdit: ({event}: {event: CalendarEvent}) => void;
  onDelete: ({event}: {event: CalendarEvent}) => void;
  onAddForDate: ({dateStr}: {dateStr: string}) => void;
  loading: boolean;
};

function CalendarView({
  events,
  categoryColorMap,
  onSelectDate,
  onEdit,
  onDelete,
  onAddForDate,
  loading,
}: CalendarViewProps) {
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth()); // 0-indexed

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{dateStr: string; day: number; isCurrentMonth: boolean}> =
    [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({
      dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(
        2,
        '0',
      )}`,
      day: d,
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
        d,
      ).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: true,
    });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(
          2,
          '0',
        )}`,
        day: d,
        isCurrentMonth: false,
      });
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else setViewMonth(m => m + 1);
  };

  const handleSelectDate = ({dateStr}: {dateStr: string}) => {
    setSelectedDate(dateStr);
    onSelectDate({dateStr});
  };

  const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const selectedEvents = (eventsByDate[selectedDate] ?? []).sort((a, b) =>
    (a.time ?? '').localeCompare(b.time ?? ''),
  );

  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{paddingBottom: SPACING.xl}}>
      {/* Month nav */}
      <View style={cal.monthNav}>
        <TouchableOpacity
          onPress={prevMonth}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="chevron-left" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={cal.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity
          onPress={nextMonth}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="chevron-right" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={cal.row}>
        {DAY_HEADERS.map((h, i) => (
          <Text key={i} style={cal.dayHeader}>
            {h}
          </Text>
        ))}
      </View>

      {/* Grid */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{marginTop: SPACING.xl}}
        />
      ) : (
        <View style={cal.grid}>
          {cells.map((cell, idx) => {
            const dayEvs = eventsByDate[cell.dateStr] ?? [];
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === today;
            return (
              <TouchableOpacity
                key={idx}
                style={[cal.cell, isSelected && cal.cellSelected]}
                onPress={() => handleSelectDate({dateStr: cell.dateStr})}
                activeOpacity={0.7}>
                <View
                  style={[
                    cal.dayNumWrap,
                    isToday && !isSelected && cal.dayNumToday,
                  ]}>
                  <Text
                    style={[
                      cal.dayNum,
                      !cell.isCurrentMonth && cal.dayNumOther,
                      isSelected && cal.dayNumSel,
                      isToday && !isSelected && cal.dayNumTodayText,
                    ]}>
                    {cell.day}
                  </Text>
                </View>
                <View style={cal.dots}>
                  {dayEvs.slice(0, 3).map((ev, i) => (
                    <View
                      key={i}
                      style={[
                        cal.dot,
                        {
                          backgroundColor:
                            categoryColorMap[ev.categoryId] ?? COLORS.primary,
                        },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Selected day events */}
      <View style={cal.dayPanel}>
        <View style={cal.dayPanelHeader}>
          <Text style={cal.dayPanelTitle}>
            {formatDate({dateStr: selectedDate})}
          </Text>
          <TouchableOpacity
            style={cal.addBtn}
            onPress={() => onAddForDate({dateStr: selectedDate})}>
            <Text style={cal.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {selectedEvents.length === 0 ? (
          <Text style={cal.noEvents}>No events on this day</Text>
        ) : (
          selectedEvents.map(ev => {
            const color = categoryColorMap[ev.categoryId] ?? COLORS.primary;
            return (
              <View
                key={ev.id}
                style={[cal.eventRow, {borderLeftColor: color}]}>
                <View style={{flex: 1}}>
                  <Text style={cal.eventTitle}>{ev.title}</Text>
                  {ev.time && (
                    <Text style={cal.eventTime}>
                      {formatTime({timeStr: ev.time})}
                    </Text>
                  )}
                  <View style={cal.eventMeta}>
                    <View style={[cal.badge, {backgroundColor: color + '22'}]}>
                      <Text style={[cal.badgeText, {color}]}>
                        {ev.categoryName}
                      </Text>
                    </View>
                    {ev.subcategoryName && (
                      <Text style={cal.subText}>{ev.subcategoryName}</Text>
                    )}
                  </View>
                </View>
                <View style={cal.eventActions}>
                  <TouchableOpacity
                    onPress={() => onEdit({event: ev})}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon
                      name="pencil-outline"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDelete({event: ev})}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon
                      name="trash-can-outline"
                      size={18}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const cal = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthLabel: {fontSize: 16, fontWeight: '700', color: COLORS.textPrimary},
  row: {flexDirection: 'row', backgroundColor: COLORS.surface},
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    paddingVertical: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.background,
    padding: 2,
  },
  cell: {
    width: '14.285%',
    minHeight: 58,
    padding: 3,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  cellSelected: {backgroundColor: COLORS.primaryLight},
  dayNumWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: {backgroundColor: COLORS.primary},
  dayNum: {fontSize: 13, fontWeight: '600', color: COLORS.textPrimary},
  dayNumOther: {color: COLORS.textMuted, opacity: 0.5},
  dayNumSel: {color: COLORS.primary, fontWeight: '800'},
  dayNumTodayText: {color: '#fff'},
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
  },
  dot: {width: 5, height: 5, borderRadius: 3},
  dayPanel: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  dayPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dayPanelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  addBtnText: {fontSize: 12, fontWeight: '700', color: '#fff'},
  noEvents: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  eventTitle: {fontSize: 14, fontWeight: '600', color: COLORS.textPrimary},
  eventTime: {fontSize: 12, color: COLORS.textMuted, marginTop: 2},
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  badge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.sm},
  badgeText: {fontSize: 11, fontWeight: '700'},
  subText: {fontSize: 11, color: COLORS.textMuted},
  eventActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    paddingTop: 2,
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

function Events() {
  const navigation = useNavigation();
  const {
    events,
    categories,
    loading,
    fetchEvents,
    fetchCategories,
    createEvent,
    updateEvent,
    deleteEvent,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useEvents();

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [addForDate, setAddForDate] = useState<string | undefined>(undefined);
  const [showManageCategories, setShowManageCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchEvents({});
  }, []);

  const doFetch = ({
    categoryId,
    subcategoryId,
  }: {
    categoryId: number | null;
    subcategoryId: number | null;
  }) => {
    fetchEvents({
      categoryId: categoryId ?? undefined,
      subcategoryId: subcategoryId ?? undefined,
    });
  };

  const handleCategoryFilter = ({categoryId}: {categoryId: number | null}) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
    doFetch({categoryId, subcategoryId: null});
  };

  const handleSubcategoryFilter = ({
    subcategoryId,
  }: {
    subcategoryId: number | null;
  }) => {
    setSelectedSubcategoryId(subcategoryId);
    doFetch({categoryId: selectedCategoryId, subcategoryId});
  };

  const handleEdit = ({event}: {event: CalendarEvent}) => {
    setEditingEvent(event);
    setAddForDate(undefined);
    setShowAddEdit(true);
  };

  const handleDelete = ({event}: {event: CalendarEvent}) => {
    Alert.alert('Delete Event', `Delete "${event.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteEvent({id: event.id}),
      },
    ]);
  };

  const handleAddForDate = ({dateStr}: {dateStr: string}) => {
    setEditingEvent(null);
    setAddForDate(dateStr);
    setShowAddEdit(true);
  };

  const handleSave = async ({
    data,
  }: {
    data: {
      title: string;
      description?: string;
      date: string;
      time?: string;
      categoryId: number;
      subcategoryId?: number;
    };
  }) => {
    if (editingEvent) {
      await updateEvent({id: editingEvent.id, data});
    } else {
      await createEvent({data});
    }
  };

  const categoryColorMap = Object.fromEntries(
    categories.map((c, i) => [c.id, getCategoryColor({index: i})]),
  );

  const manageCategoriesData: CategoryForManage[] = categories.map(c => ({
    id: c.id,
    name: c.name,
    subcategories: c.subcategories,
    itemCount: c.itemCount,
  }));

  const selectedCategoryObj =
    categories.find(c => c.id === selectedCategoryId) ?? null;
  const subcategoryOptions = selectedCategoryObj?.subcategories ?? [];

  const sections = groupByDate({events});

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon name="calendar-star" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowManageCategories(true)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.headerBtn}>
            <Icon
              name="tag-multiple-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          {view === 'list' && (
            <TouchableOpacity
              onPress={() => {
                setEditingEvent(null);
                setAddForDate(undefined);
                setShowAddEdit(true);
              }}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.headerBtn}>
              <Icon name="plus" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setView(v => (v === 'list' ? 'calendar' : 'list'))}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.headerBtn}>
            <Icon
              name={
                view === 'list'
                  ? 'calendar-month-outline'
                  : 'format-list-bulleted'
              }
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="home-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedCategoryId && styles.filterChipActive,
          ]}
          onPress={() => handleCategoryFilter({categoryId: null})}>
          <Text
            style={[
              styles.filterChipText,
              !selectedCategoryId && styles.filterChipTextActive,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat, i) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              selectedCategoryId === cat.id && {
                backgroundColor: getCategoryColor({index: i}),
                borderColor: getCategoryColor({index: i}),
              },
            ]}
            onPress={() => handleCategoryFilter({categoryId: cat.id})}>
            <Text
              style={[
                styles.filterChipText,
                selectedCategoryId === cat.id && {color: '#fff'},
              ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subcategory filter (shown only when a category with subcategories is selected) */}
      {subcategoryOptions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={[styles.filterBar, styles.subFilterBar]}>
          <TouchableOpacity
            style={[
              styles.subChip,
              !selectedSubcategoryId && styles.subChipActive,
            ]}
            onPress={() => handleSubcategoryFilter({subcategoryId: null})}>
            <Text
              style={[
                styles.subChipText,
                !selectedSubcategoryId && styles.subChipTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          {subcategoryOptions.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.subChip,
                selectedSubcategoryId === sub.id && styles.subChipActive,
              ]}
              onPress={() => handleSubcategoryFilter({subcategoryId: sub.id})}>
              <Text
                style={[
                  styles.subChipText,
                  selectedSubcategoryId === sub.id && styles.subChipTextActive,
                ]}>
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      {view === 'calendar' ? (
        <CalendarView
          events={events}
          categoryColorMap={categoryColorMap}
          onSelectDate={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddForDate={handleAddForDate}
          loading={loading}
        />
      ) : loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon
            name="calendar-blank-outline"
            size={52}
            color={COLORS.textMuted}
          />
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptySub}>Tap + to add your first event</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({section: {title}}) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({item}) => {
            const color = categoryColorMap[item.categoryId] ?? COLORS.primary;
            return (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => handleEdit({event: item})}
                activeOpacity={0.7}>
                <View style={[styles.colorStripe, {backgroundColor: color}]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDelete({event: item})}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Icon
                        name="trash-can-outline"
                        size={18}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardMeta}>
                    {item.time && (
                      <View style={styles.metaItem}>
                        <Icon
                          name="clock-outline"
                          size={13}
                          color={COLORS.textMuted}
                        />
                        <Text style={styles.metaText}>
                          {formatTime({timeStr: item.time})}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.categoryBadge,
                        {backgroundColor: color + '22'},
                      ]}>
                      <Text style={[styles.categoryBadgeText, {color}]}>
                        {item.categoryName}
                      </Text>
                    </View>
                    {item.subcategoryName && (
                      <Text style={styles.subcategoryText}>
                        {item.subcategoryName}
                      </Text>
                    )}
                  </View>
                  {item.description ? (
                    <Text style={styles.description}>{item.description}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Modals */}
      <AddEditEventModal
        visible={showAddEdit}
        event={editingEvent}
        defaultDate={addForDate}
        categories={categories}
        onSave={handleSave}
        onClose={() => {
          setShowAddEdit(false);
          setEditingEvent(null);
          setAddForDate(undefined);
        }}
      />
      <ManageCategoriesModal
        visible={showManageCategories}
        categories={manageCategoriesData}
        onClose={() => setShowManageCategories(false)}
        onAddCategory={(name, subcategoryNames) =>
          createCategory({name, subcategoryNames})
        }
        onUpdateCategory={(id, name) => updateCategory({id, name})}
        onCreateSubcategory={(categoryId, name) =>
          createSubcategory({categoryId, name})
        }
        onUpdateSubcategory={(id, name) => updateSubcategory({id, name})}
        onDeleteSubcategory={id => deleteSubcategory({id})}
        onDeleteCategory={id => deleteCategory({id})}
      />
    </SafeAreaView>
  );
}

export default Events;

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
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
    backgroundColor: '#F3E5F5',
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
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 4},
  headerBtn: {padding: 4},
  filterBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 52,
  },
  subFilterBar: {backgroundColor: COLORS.background, maxHeight: 44},
  filterRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {color: COLORS.surface},
  subChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  subChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  subChipText: {fontSize: 12, fontWeight: '600', color: COLORS.textMuted},
  subChipTextActive: {color: COLORS.primary},
  loader: {marginTop: SPACING.xl * 2},
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  emptyTitle: {fontSize: 16, fontWeight: '600', color: COLORS.textSecondary},
  emptySub: {fontSize: 13, color: COLORS.textMuted},
  listContent: {padding: SPACING.md, paddingBottom: SPACING.xl},
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  colorStripe: {width: 4},
  cardBody: {flex: 1, padding: SPACING.md},
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: 6,
  },
  metaItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  metaText: {fontSize: 12, color: COLORS.textMuted},
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {fontSize: 11, fontWeight: '700'},
  subcategoryText: {fontSize: 12, color: COLORS.textMuted},
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
});
