import React, { ReactElement, useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchAllUsers, setUserPermissions, createUser, deleteUser } from '../../api/auth.api';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../../lib/theme';

const ALL_PAGES = [
  { key: 'irrigation', label: 'Irrigation' },
  { key: 'rowing', label: 'Rowing' },
  { key: 'people', label: 'People' },
  { key: 'todo', label: 'To Do' },
  { key: 'events', label: 'Events' },
  { key: 'devices', label: 'Devices' },
  { key: 'admin', label: 'Admin' },
];

type UserRow = { id: number; username: string; permissions: Record<string, boolean> };

function Admin(): ReactElement {
  const navigation = useNavigation();
  const { userId: currentUserId } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [dirty, setDirty] = useState<Record<number, Record<string, boolean>>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAllUsers()
      .then((data) => {
        setUsers(data);
        const initial: Record<number, Record<string, boolean>> = {};
        data.forEach((u) => { initial[u.id] = { ...u.permissions }; });
        setDirty(initial);
      })
      .catch(() => Alert.alert('Error', 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const togglePermission = (userId: number, page: string): void => {
    setDirty((prev) => {
      const current = prev[userId] ?? {};
      return { ...prev, [userId]: { ...current, [page]: !current[page] } };
    });
  };

  const handleSave = async (userId: number): Promise<void> => {
    setSaving(userId);
    try {
      await setUserPermissions(userId, dirty[userId] ?? {});
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, permissions: { ...dirty[userId] } } : u));
    } catch {
      Alert.alert('Error', 'Failed to save permissions');
    } finally {
      setSaving(null);
    }
  };

  const handleAddUser = async (): Promise<void> => {
    if (!newUsername.trim() || !newPassword) return;
    setAdding(true);
    try {
      await createUser({ username: newUsername.trim(), password: newPassword });
      const data = await fetchAllUsers();
      setUsers(data);
      const refreshed: Record<number, Record<string, boolean>> = {};
      data.forEach((u) => { refreshed[u.id] = { ...u.permissions }; });
      setDirty(refreshed);
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
    } catch {
      Alert.alert('Error', 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = (userId: number, username: string): void => {
    Alert.alert(
      'Delete User',
      `Delete "${username}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser({ userId });
              setUsers((prev) => prev.filter((u) => u.id !== userId));
              setDirty((prev) => { const next = { ...prev }; delete next[userId]; return next; });
            } catch {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="account-plus-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {users.map((user) => {
            const userPerms = dirty[user.id] ?? {};
            const isDirty = JSON.stringify(userPerms) !== JSON.stringify(user.permissions);
            const isSelf = user.id === currentUserId;

            return (
              <View key={user.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Icon name="account-circle-outline" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.username}>{user.username}</Text>
                  {isDirty && (
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => handleSave(user.id)}
                      disabled={saving === user.id}
                    >
                      {saving === user.id
                        ? <ActivityIndicator size="small" color={COLORS.surface} />
                        : <Text style={styles.saveBtnText}>Save</Text>
                      }
                    </TouchableOpacity>
                  )}
                  {!isSelf && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteUser(user.id, user.username)}
                    >
                      <Icon name="delete-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.chipGrid}>
                  {ALL_PAGES.map(({ key, label }) => {
                    const granted = !!userPerms[key];
                    const locked = isSelf && key === 'admin';
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.chip, granted ? styles.chipGranted : styles.chipDenied, locked && styles.chipLocked]}
                        onPress={() => !locked && togglePermission(user.id, key)}
                        activeOpacity={locked ? 1 : 0.7}
                      >
                        <Text style={[styles.chipText, granted ? styles.chipTextGranted : styles.chipTextDenied]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
          <TouchableOpacity style={styles.modal} activeOpacity={1}>
            <Text style={styles.modalTitle}>Add User</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.textMuted}
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, (!newUsername.trim() || !newPassword) && styles.createBtnDisabled]}
                onPress={handleAddUser}
                disabled={adding || !newUsername.trim() || !newPassword}
              >
                {adding
                  ? <ActivityIndicator size="small" color={COLORS.surface} />
                  : <Text style={styles.createBtnText}>Create</Text>
                }
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default Admin;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  addBtn: {
    padding: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minWidth: 56,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
  },
  chipGranted: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipDenied: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  chipLocked: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextGranted: {
    color: COLORS.primary,
  },
  chipTextDenied: {
    color: COLORS.textMuted,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
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
  deleteBtn: {
    padding: 4,
  },
});
