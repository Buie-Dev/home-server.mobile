import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import useMegan, {MeganIdea} from '../../hooks/useMegan.hook';
import AddIdeaModal from '../../components/AddIdeaModal/AddIdeaModal';
import ManageCategoriesModal, {
  CategoryForManage,
} from '../../components/ManageCategoriesModal/ManageCategoriesModal';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../../lib/theme';

const IdeaCard = ({
  idea,
  onEdit,
  onDelete,
}: {
  idea: MeganIdea;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <View style={styles.card}>
    <View style={[styles.cardAccent, {backgroundColor: COLORS.primary}]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {idea.title}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="pencil-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="trash-can-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{idea.categoryName}</Text>
        </View>
        {idea.subcategoryName && (
          <View style={[styles.badge, styles.badgeSub]}>
            <Text style={styles.badgeText}>{idea.subcategoryName}</Text>
          </View>
        )}
      </View>
      {!!idea.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {idea.notes}
        </Text>
      )}
    </View>
  </View>
);

function Ideas() {
  const navigation = useNavigation();
  const {
    categories,
    ideas,
    loading,
    fetchCategories,
    fetchIdeas,
    createCategory,
    createSubcategory,
    updateCategory,
    updateSubcategory,
    deleteSubcategory,
    deleteCategory,
    createIdea,
    updateIdea,
    deleteIdea,
  } = useMegan();

  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(
    undefined,
  );
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<
    number | undefined
  >(undefined);
  const [showAddIdea, setShowAddIdea] = useState<boolean>(false);
  const [editingIdea, setEditingIdea] = useState<MeganIdea | null>(null);
  const [showManage, setShowManage] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchIdeas();
  }, []);

  const selectedCategory =
    categories.find(c => c.id === activeCategoryId) ?? null;
  const subcategories = selectedCategory?.subcategories ?? [];

  const selectCategory = (id: number) => {
    const next = activeCategoryId === id ? undefined : id;
    setActiveCategoryId(next);
    setActiveSubcategoryId(undefined);
    fetchIdeas(next, undefined);
  };

  const selectSubcategory = (id: number) => {
    const next = activeSubcategoryId === id ? undefined : id;
    setActiveSubcategoryId(next);
    fetchIdeas(activeCategoryId, next);
  };

  const clearFilter = () => {
    setActiveCategoryId(undefined);
    setActiveSubcategoryId(undefined);
    fetchIdeas(undefined, undefined);
  };

  const handleSaveIdea = async (data: {
    title: string;
    categoryId: number;
    subcategoryId?: number;
    notes?: string;
  }) => {
    if (editingIdea) {
      await updateIdea(editingIdea.id, data);
      setEditingIdea(null);
    } else {
      await createIdea(data);
      setShowAddIdea(false);
    }
    fetchIdeas(activeCategoryId, activeSubcategoryId);
  };

  const handleDeleteIdea = (idea: MeganIdea) => {
    Alert.alert('Delete Idea', `Delete "${idea.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteIdea(idea.id),
      },
    ]);
  };

  const handleAddCategory = async (
    name: string,
    subcategoryNames: string[],
  ) => {
    await createCategory(name, subcategoryNames);
  };

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon name="flower-outline" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Ideas</Text>
        <TouchableOpacity
          onPress={() => setShowManage(true)}
          style={styles.headerBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="cog-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="home-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      {categories.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[null, ...categories]}
            keyExtractor={(_, i) => String(i)}
            style={styles.filterRow}
            contentContainerStyle={styles.filterContent}
            renderItem={({item}) => {
              if (item === null) {
                return (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      !activeCategoryId && styles.chipActive,
                    ]}
                    onPress={clearFilter}>
                    <Text
                      style={[
                        styles.chipText,
                        !activeCategoryId && styles.chipTextActive,
                      ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    activeCategoryId === item.id && styles.chipActive,
                  ]}
                  onPress={() => selectCategory(item.id)}>
                  <Text
                    style={[
                      styles.chipText,
                      activeCategoryId === item.id && styles.chipTextActive,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          {subcategories.length > 0 && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[null, ...subcategories]}
              keyExtractor={(_, i) => String(i)}
              style={[styles.filterRow, styles.filterRowBorder]}
              contentContainerStyle={styles.filterContent}
              renderItem={({item}) => {
                if (item === null) {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        !activeSubcategoryId && styles.chipActive,
                      ]}
                      onPress={() => {
                        setActiveSubcategoryId(undefined);
                        fetchIdeas(activeCategoryId, undefined);
                      }}>
                      <Text
                        style={[
                          styles.chipText,
                          !activeSubcategoryId && styles.chipTextActive,
                        ]}>
                        All
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      activeSubcategoryId === item.id && styles.chipActive,
                    ]}
                    onPress={() => selectSubcategory(item.id)}>
                    <Text
                      style={[
                        styles.chipText,
                        activeSubcategoryId === item.id &&
                          styles.chipTextActive,
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Ideas list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={ideas}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <IdeaCard
              idea={item}
              onEdit={() => setEditingIdea(item)}
              onDelete={() => handleDeleteIdea(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon
                name="lightbulb-outline"
                size={52}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>No ideas yet</Text>
              <Text style={styles.emptySub}>Tap below to add one</Text>
            </View>
          }
        />
      )}

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddIdea(true)}>
          <Icon name="plus" size={20} color={COLORS.surface} />
          <Text style={styles.addBtnText}>Add Idea</Text>
        </TouchableOpacity>
      </View>

      <AddIdeaModal
        visible={showAddIdea || !!editingIdea}
        categories={categories}
        initialIdea={editingIdea}
        onClose={() => {
          setShowAddIdea(false);
          setEditingIdea(null);
        }}
        onSave={handleSaveIdea}
      />
      <ManageCategoriesModal
        visible={showManage}
        categories={categories.map(
          (c): CategoryForManage => ({
            id: c.id,
            name: c.name,
            subcategories: c.subcategories,
            itemCount: c.ideaCount,
          }),
        )}
        onClose={() => setShowManage(false)}
        onAddCategory={handleAddCategory}
        onUpdateCategory={updateCategory}
        onCreateSubcategory={createSubcategory}
        onUpdateSubcategory={updateSubcategory}
        onDeleteSubcategory={deleteSubcategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </SafeAreaView>
  );
}

export default Ideas;

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
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  headerBtn: {padding: 4},
  filterContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterRow: {maxHeight: 64},
  filterRowBorder: {borderTopWidth: 1, borderTopColor: COLORS.border},
  filterContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
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
  loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {flex: 1},
  listContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  cardAccent: {width: 4},
  cardBody: {flex: 1, padding: SPACING.md},
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardActions: {flexDirection: 'row', alignItems: 'center', gap: SPACING.sm},
  deleteBtn: {marginLeft: 2},
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
  },
  badgeSub: {backgroundColor: COLORS.divider},
  badgeText: {fontSize: 11, fontWeight: '600', color: COLORS.primary},
  notes: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyTitle: {fontSize: 16, fontWeight: '600', color: COLORS.textSecondary},
  emptySub: {fontSize: 13, color: COLORS.textMuted},
  bottomBar: {padding: SPACING.md},
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.card,
  },
  addBtnText: {fontSize: 15, fontWeight: '700', color: COLORS.surface},
});
