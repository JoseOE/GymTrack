import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionTitle } from '@/components/ui';
import { getNextSchedule } from '@/constants/workoutSchedule';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { RecentWorkout } from '@/domain/models';

export function WorkoutCompletedState({ workout, onAdditional }: { workout: RecentWorkout; onAdditional: () => void }) {
  const next = getNextSchedule(new Date());
  const completedTime = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(new Date(workout.completedAt));
  return (
    <Screen key="completed-today">
      <ScreenHeader title="Entrenar" subtitle="Sesión guardada en este dispositivo" />
      <View style={styles.success}><View style={styles.successIcon}><Ionicons color={colors.background} name="checkmark" size={46} /></View><Text style={styles.successTitle}>Entrenamiento de hoy completado</Text><Text style={styles.successText}>Buen trabajo. Tu progreso semanal ya fue actualizado.</Text></View>
      <Card style={styles.summary}>
        <Text style={styles.workoutName}>{workout.title}</Text>
        <View style={styles.metrics}><Metric label="Duración" value={`${workout.durationMinutes} min`} /><Metric label="Ejercicios" value={String(workout.exerciseCount)} /><Metric label="Series" value={String(workout.setCount)} /><Metric label="Finalizado" value={completedTime} /></View>
      </Card>
      <View style={styles.section}><SectionTitle>Próximo entrenamiento</SectionTitle><Card style={styles.nextCard}><View style={[styles.nextIcon, next.isRest && styles.restIcon]}><Ionicons color={next.isRest ? colors.textMuted : colors.primary} name={next.isRest ? 'moon-outline' : 'calendar-outline'} size={22} /></View><View style={styles.nextCopy}><Text style={styles.nextDay}>{next.dayName}</Text><Text style={[styles.nextWorkout, next.isRest && styles.restText]}>{next.workoutName}</Text>{next.estimatedMinutes ? <Text style={styles.nextDuration}>{next.estimatedMinutes} min{next.isOptional ? ' · opcional' : ''}</Text> : null}</View></Card></View>
      <PrimaryButton icon="stats-chart-outline" title="Ver progreso" onPress={() => router.push('/progress')} />
      <SecondaryButton icon="home-outline" title="Volver al inicio" onPress={() => router.push('/')} />
      <SecondaryButton icon="add-circle-outline" title="Entrenamiento adicional" onPress={onAdditional} />
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  success: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }, successIcon: { width: 82, height: 82, borderRadius: radii.pill, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, successTitle: { ...typography.title, color: colors.text, textAlign: 'center' }, successText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  summary: { gap: spacing.lg }, workoutName: { ...typography.heading, color: colors.text }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }, metric: { width: '44%', gap: spacing.xs }, metricValue: { ...typography.heading, color: colors.primary }, metricLabel: { ...typography.caption, color: colors.textMuted },
  section: { gap: spacing.md }, nextCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, nextIcon: { width: 46, height: 46, borderRadius: radii.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, restIcon: { backgroundColor: colors.surfaceElevated }, nextCopy: { flex: 1 }, nextDay: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' }, nextWorkout: { ...typography.body, color: colors.text, fontWeight: '800', marginTop: spacing.xs }, restText: { color: colors.textMuted }, nextDuration: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.xs },
});
