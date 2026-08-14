import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { exercises } from '@/data/mockData';

export function WorkoutScreen() {
  return (
    <Screen>
      <ScreenHeader title="Entrenar" subtitle="Espalda + Bíceps · 18:42" />
      <View style={styles.summary}><Text style={styles.summaryText}>2 / 9 series</Text><View style={styles.track}><View style={styles.fill} /></View></View>
      <View style={styles.exerciseList}>{exercises.map((exercise, exerciseIndex) => <Card key={exercise.id} style={styles.exerciseCard}><View style={styles.exerciseHeader}><View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text></View><View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.muscle}>{exercise.muscle} · {exercise.sets.length} series</Text></View><Ionicons color={colors.textMuted} name="ellipsis-horizontal" size={21} /></View><View style={styles.tableHeader}><Text style={[styles.columnLabel, styles.setColumn]}>SERIE</Text><Text style={styles.columnLabel}>KG</Text><Text style={styles.columnLabel}>REPS</Text><Text style={styles.checkColumn}>✓</Text></View>{exercise.sets.map((set) => <View key={set.number} style={styles.setRow}><Text style={[styles.setNumber, styles.setColumn]}>{set.number}</Text><View style={styles.inputMock}><Text style={styles.inputText}>{set.weight}</Text></View><View style={styles.inputMock}><Text style={styles.inputText}>{set.reps}</Text></View><View style={[styles.checkbox, set.completed && styles.checkboxDone]}>{set.completed ? <Ionicons color={colors.background} name="checkmark" size={17} /> : null}</View></View>)}</Card>)}</View>
      <PrimaryButton icon="checkmark-circle-outline" title="Finalizar entrenamiento" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.sm }, summaryText: { ...typography.caption, color: colors.textMuted, textAlign: 'right' }, track: { height: 5, backgroundColor: colors.surfaceElevated, borderRadius: radii.pill }, fill: { height: '100%', width: '22%', backgroundColor: colors.primary, borderRadius: radii.pill },
  exerciseList: { gap: spacing.lg }, exerciseCard: { padding: spacing.lg }, exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }, exerciseNumber: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }, exerciseNumberText: { ...typography.body, color: colors.primary, fontWeight: '800' }, exerciseCopy: { flex: 1 }, exerciseName: { ...typography.heading, color: colors.text }, muscle: { ...typography.caption, color: colors.textMuted },
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }, columnLabel: { ...typography.label, color: colors.textSubtle, flex: 1, textAlign: 'center' }, setColumn: { width: 42, flex: 0, textAlign: 'center' }, checkColumn: { width: 38, color: colors.textSubtle, textAlign: 'center' }, setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }, setNumber: { ...typography.body, color: colors.textMuted }, inputMock: { flex: 1, height: 42, borderRadius: radii.sm, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }, inputText: { ...typography.body, color: colors.text, fontWeight: '700' }, checkbox: { width: 38, height: 38, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
});
