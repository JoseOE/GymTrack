import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';

const WEIGHT_STEP_KG = 2.5;

function formatWeight(weightKg: number) {
  return Number.isInteger(weightKg) ? String(weightKg) : weightKg.toFixed(1);
}

export function PersonalRecordEditorModal({
  exerciseName,
  weightKg,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  exerciseName: string | null;
  weightKg: number;
  saving: boolean;
  onChange: (weightKg: number) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!exerciseName) return null;
  return (
    <Modal
      animationType="fade"
      onRequestClose={() => { if (!saving) onCancel(); }}
      statusBarTranslucent
      transparent
      visible
    >
      <View accessibilityViewIsModal style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>{exerciseName}</Text>
            <Text style={styles.help}>Ajusta tu récord manual en incrementos de 2.5 kg.</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              accessibilityLabel={`Disminuir ${exerciseName} 2.5 kg`}
              accessibilityRole="button"
              disabled={saving || weightKg === 0}
              onPress={() => onChange(Math.max(0, weightKg - WEIGHT_STEP_KG))}
              style={({ pressed }) => [styles.stepButton, pressed && styles.pressed, (saving || weightKg === 0) && styles.disabled]}
            >
              <Ionicons color={colors.text} name="remove" size={24} />
            </Pressable>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{formatWeight(weightKg)} kg</Text>
              {weightKg === 0 ? <Text style={styles.pending}>Se mostrará Pendiente</Text> : null}
            </View>
            <Pressable
              accessibilityLabel={`Aumentar ${exerciseName} 2.5 kg`}
              accessibilityRole="button"
              disabled={saving}
              onPress={() => onChange(weightKg + WEIGHT_STEP_KG)}
              style={({ pressed }) => [styles.stepButton, pressed && styles.pressed, saving && styles.disabled]}
            >
              <Ionicons color={colors.text} name="add" size={24} />
            </Pressable>
          </View>
          <View style={styles.actions}>
            <View style={styles.action}><SecondaryButton disabled={saving} onPress={onCancel} title="Cancelar" /></View>
            <View style={styles.action}><PrimaryButton icon="checkmark" loading={saving} onPress={onSave} title="Guardar" /></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.76)', justifyContent: 'center', padding: spacing.xl },
  dialog: { width: '100%', maxWidth: 500, alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.xl, gap: spacing.xl, elevation: 12 },
  copy: { gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  help: { ...typography.body, color: colors.textMuted },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  stepButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated },
  valueContainer: { flex: 1, alignItems: 'center', gap: spacing.xs },
  value: { ...typography.title, color: colors.text, textAlign: 'center' },
  pending: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
});
