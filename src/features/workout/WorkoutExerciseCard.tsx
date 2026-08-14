import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, SecondaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { RemoveWorkoutSetResult, WorkoutExercise, WorkoutSet } from '@/domain/models';

type Props = {
  exercise: WorkoutExercise;
  index: number;
  onUpdateSet: (set: WorkoutSet) => Promise<void>;
  onAddSet: () => Promise<void>;
  onRemoveSet: (setId: string) => Promise<RemoveWorkoutSetResult>;
};

export function WorkoutExerciseCard({ exercise, index, onUpdateSet, onAddSet, onRemoveSet }: Props) {
  return <Card style={styles.card}><View style={styles.header}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><View style={styles.copy}><Text style={styles.name}>{exercise.name}</Text><Text style={styles.muscle}>{exercise.muscle} · {exercise.sets.length} series</Text></View></View><View style={styles.tableHeader}><Text style={[styles.columnLabel, styles.setColumn]}>SERIE</Text><Text style={styles.columnLabel}>KG</Text><Text style={styles.columnLabel}>REPS</Text><Text style={styles.actionColumn}>✓</Text><Text style={styles.deleteColumn}>—</Text></View>{exercise.sets.map((set) => <SetRow key={set.id} set={set} onRemove={() => onRemoveSet(set.id)} onUpdate={onUpdateSet} />)}<SecondaryButton icon="add" title="Agregar serie" onPress={() => void onAddSet()} /></Card>;
}

function SetRow({ set, onUpdate, onRemove }: { set: WorkoutSet; onUpdate: (set: WorkoutSet) => Promise<void>; onRemove: () => Promise<RemoveWorkoutSetResult> }) {
  const [weight, setWeight] = useState(String(set.weightKg));
  const [reps, setReps] = useState(String(set.repetitions));
  const persistNumbers = () => void onUpdate({ ...set, weightKg: Math.max(0, Number(weight.replace(',', '.')) || 0), repetitions: Math.max(0, Math.round(Number(reps) || 0)) });
  return <View style={[styles.setRow, set.completed && styles.completedRow]}><Text style={[styles.setNumber, styles.setColumn]}>{set.setNumber}</Text><TextInput keyboardType="decimal-pad" onBlur={persistNumbers} onChangeText={setWeight} selectTextOnFocus style={styles.input} value={weight} /><TextInput keyboardType="number-pad" onBlur={persistNumbers} onChangeText={setReps} selectTextOnFocus style={styles.input} value={reps} /><Pressable accessibilityLabel={`Marcar serie ${set.setNumber}`} onPress={() => void onUpdate({ ...set, completed: !set.completed, weightKg: Math.max(0, Number(weight.replace(',', '.')) || 0), repetitions: Math.max(0, Math.round(Number(reps) || 0)) })} style={({ pressed }) => [styles.checkbox, set.completed && styles.checkboxDone, pressed && styles.pressed]}>{set.completed ? <Ionicons color={colors.background} name="checkmark" size={17} /> : null}</Pressable><Pressable accessibilityLabel={`Eliminar serie ${set.setNumber}`} disabled={set.completed} onPress={() => void onRemove()} style={({ pressed }) => [styles.delete, set.completed && styles.disabled, pressed && styles.pressed]}><Ionicons color={colors.danger} name="trash-outline" size={18} /></Pressable></View>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md }, header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }, number: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }, numberText: { ...typography.body, color: colors.primary, fontWeight: '800' }, copy: { flex: 1 }, name: { ...typography.heading, color: colors.text }, muscle: { ...typography.caption, color: colors.textMuted },
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, columnLabel: { ...typography.label, color: colors.textSubtle, flex: 1, textAlign: 'center' }, setColumn: { width: 42, flex: 0, textAlign: 'center' }, actionColumn: { width: 38, color: colors.textSubtle, textAlign: 'center' }, deleteColumn: { width: 34, color: colors.textSubtle, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.sm }, completedRow: { backgroundColor: colors.primarySoft }, setNumber: { ...typography.body, color: colors.textMuted }, input: { ...typography.body, flex: 1, height: 42, minWidth: 55, borderRadius: radii.sm, backgroundColor: colors.surfaceElevated, color: colors.text, fontWeight: '700', textAlign: 'center' }, checkbox: { width: 38, height: 38, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary }, delete: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.65 }, disabled: { opacity: 0.25 },
});
