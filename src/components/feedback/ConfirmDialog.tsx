import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ConfirmOptions, DialogTone } from '@/components/feedback/types';
import { colors, radii, spacing, typography } from '@/constants/theme';

const toneColors: Record<DialogTone, string> = { normal: colors.primary, warning: colors.warning, danger: colors.danger };

export function ConfirmDialog({ options, loading, onCancel, onConfirm }: { options: ConfirmOptions | null; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!options) return null;
  const tone = options.tone ?? 'normal';
  const accent = toneColors[tone];
  return (
    <Modal animationType="fade" onRequestClose={() => { if (!loading) onCancel(); }} statusBarTranslucent transparent visible>
      <View accessibilityViewIsModal style={styles.overlay}>
        <View style={styles.dialog}>
          {options.icon ? <View style={[styles.icon, { backgroundColor: `${accent}20` }]}><Ionicons color={accent} name={options.icon} size={30} /></View> : null}
          <View style={styles.copy}><Text accessibilityRole="header" style={styles.title}>{options.title}</Text><Text style={styles.message}>{options.message}</Text></View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onCancel} style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed, loading && styles.disabled]}><Text style={styles.cancelText}>{options.cancelLabel}</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onConfirm} style={({ pressed }) => [styles.button, { backgroundColor: accent }, pressed && styles.pressed, loading && styles.disabled]}>{loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.confirmText}>{options.confirmLabel}</Text>}</Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.76)', justifyContent: 'center', padding: spacing.xl },
  dialog: { width: '100%', maxWidth: 500, alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.xl, gap: spacing.lg, elevation: 12 },
  icon: { width: 56, height: 56, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' }, copy: { gap: spacing.sm }, title: { ...typography.title, color: colors.text }, message: { ...typography.body, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.md }, button: { flex: 1, minHeight: 50, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }, cancelButton: { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }, cancelText: { ...typography.body, color: colors.text, fontWeight: '700', textAlign: 'center' }, confirmText: { ...typography.body, color: colors.background, fontWeight: '800', textAlign: 'center' }, pressed: { opacity: 0.72 }, disabled: { opacity: 0.6 },
});
