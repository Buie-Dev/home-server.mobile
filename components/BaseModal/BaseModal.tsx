import React, {ReactElement, ReactNode} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, RADIUS, SHADOWS, SPACING} from '../../lib/theme';
import Button, {BUTTON_STYLE} from '../Button/Button';

interface BaseModalProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  onClose: () => void;
  onAction?: () => void;
  actionTitle?: string;
  actionStyle?: BUTTON_STYLE;
  fullScreen?: boolean;
}

function BaseModal({
  open,
  title,
  children,
  onClose,
  onAction,
  actionTitle = 'Save',
  actionStyle = BUTTON_STYLE.SOLID,
  fullScreen = false,
}: BaseModalProps): ReactElement {
  const header = (
    <View style={[styles.header, fullScreen && styles.headerFullScreen]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Icon name="close" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const actions = (
    <View style={[styles.actions, fullScreen && styles.actionsFullScreen]}>
      <Button
        label="Cancel"
        onPress={onClose}
        style={BUTTON_STYLE.OUTLINE}
        customStyle={styles.actionBtn}
      />
      {!!onAction && (
        <Button
          label={actionTitle}
          onPress={onAction}
          style={actionStyle}
          customStyle={styles.actionBtn}
        />
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal visible={open} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.fullScreenContainer}>
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {header}
            <View style={styles.fullScreenBody}>{children}</View>
            {actions}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          {header}
          <View style={styles.body}>{children}</View>
          {actions}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ── Bottom sheet ──────────────────────────────────────────
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  // ── Full screen ───────────────────────────────────────────
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullScreenBody: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  actionsFullScreen: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  // ── Shared ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerFullScreen: {
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
  },
});

export default BaseModal;
