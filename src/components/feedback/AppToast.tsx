import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ToastOptions, ToastType } from '@/components/feedback/types';
import { colors, radii, spacing, typography } from '@/constants/theme';

const toastAppearance: Record<ToastType, { color: string; icon: 'checkmark-circle' | 'alert-circle' | 'warning' | 'information-circle' }> = {
  success: { color: colors.success, icon: 'checkmark-circle' },
  error: { color: colors.danger, icon: 'alert-circle' },
  warning: { color: colors.warning, icon: 'warning' },
  info: { color: '#6EA8FE', icon: 'information-circle' },
};

export function AppToast({ toast, onDismiss }: { toast: ToastOptions; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(-24));
  const [opacity] = useState(() => new Animated.Value(0));
  const appearance = toastAppearance[toast.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180, mass: 0.8 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -16, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) onDismiss(); });
    }, toast.durationMs ?? (toast.type === 'error' ? 4000 : 3000));
    return () => clearTimeout(timer);
  }, [onDismiss, opacity, toast.durationMs, toast.type, translateY]);

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { paddingTop: insets.top + spacing.sm }]}>
      <Animated.View style={[styles.toast, { borderColor: appearance.color, opacity, transform: [{ translateY }] }]}>
        <View style={[styles.icon, { backgroundColor: `${appearance.color}20` }]}><Ionicons color={appearance.color} name={appearance.icon} size={22} /></View>
        <View style={styles.copy}><Text accessibilityLiveRegion="polite" style={styles.title}>{toast.title}</Text>{toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}</View>
        <Pressable accessibilityLabel="Cerrar mensaje" accessibilityRole="button" hitSlop={10} onPress={onDismiss} style={({ pressed }) => pressed && styles.pressed}><Ionicons color={colors.textMuted} name="close" size={20} /></Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, paddingHorizontal: spacing.lg, alignItems: 'center' },
  toast: { width: '100%', maxWidth: 520, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, elevation: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  icon: { width: 42, height: 42, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 }, title: { ...typography.body, color: colors.text, fontWeight: '800' }, message: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs }, pressed: { opacity: 0.55 },
});
