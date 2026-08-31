import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Metric, ProgressBar, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { PersonalRecordExerciseKey } from '@/domain/models';
import { PersonalRecordEditorModal } from '@/features/progress/PersonalRecordEditorModal';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

const bars = [32, 54, 42, 76, 64, 92, 70];
const personalRecordDefinitions: { exerciseKey: PersonalRecordExerciseKey; exerciseName: string }[] = [
  { exerciseKey: 'bench_press', exerciseName: 'Press banca' },
  { exerciseKey: 'squat', exerciseName: 'Sentadilla' },
  { exerciseKey: 'deadlift', exerciseName: 'Peso muerto' },
];

function formatWeight(weightKg: number) {
  return `${Number.isInteger(weightKg) ? weightKg : weightKg.toFixed(1)} kg`;
}

export function ProgressScreen() {
  const { personalRecords, recentWorkouts, savePersonalRecord, weeklyProgress } = useGymTrack();
  const { showToast } = useFeedback();
  const [editingKey, setEditingKey] = useState<PersonalRecordExerciseKey | null>(null);
  const [draftWeightKg, setDraftWeightKg] = useState(0);
  const [saving, setSaving] = useState(false);
  const percentage = weeklyProgress.target ? Math.min(100, Math.max(0, (weeklyProgress.completed / weeklyProgress.target) * 100)) : 0;
  const editingDefinition = personalRecordDefinitions.find((definition) => definition.exerciseKey === editingKey) ?? null;

  const openEditor = (exerciseKey: PersonalRecordExerciseKey) => {
    const record = personalRecords.find((item) => item.exerciseKey === exerciseKey);
    setDraftWeightKg(record?.weightKg ?? 0);
    setEditingKey(exerciseKey);
  };

  const handleSave = async () => {
    if (!editingKey || !editingDefinition) return;
    setSaving(true);
    try {
      await savePersonalRecord(editingKey, draftWeightKg);
      setEditingKey(null);
      showToast({
        type: 'success',
        title: draftWeightKg === 0 ? 'Récord marcado como pendiente' : 'Récord actualizado',
        message: draftWeightKg === 0 ? editingDefinition.exerciseName : `${editingDefinition.exerciseName}: ${formatWeight(draftWeightKg)}`,
      });
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo guardar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Screen>
        <ScreenHeader title="Progreso" subtitle="Historial local y métricas" />
        <View style={styles.metrics}>
          <Card style={styles.metricCard}><Metric icon="checkmark-circle-outline" label="Esta semana · real" value={String(weeklyProgress.completed)} /></Card>
          <Card style={styles.metricCard}><Metric icon="time-outline" label="Sesiones recientes · real" value={String(recentWorkouts.length)} /></Card>
        </View>
        <View style={styles.section}>
          <SectionTitle detail="Datos locales">Entrenamientos recientes</SectionTitle>
          {recentWorkouts.length === 0 ? (
            <Card>
              <Text style={styles.emptyTitle}>Aún no hay sesiones completadas</Text>
              <Text style={styles.emptyText}>Finaliza un entrenamiento y aparecerá aquí con su duración, ejercicios y series.</Text>
            </Card>
          ) : (
            <View style={styles.list}>
              {recentWorkouts.map((workout) => (
                <Card key={workout.id} style={styles.historyCard}>
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyTitle}>{workout.title}</Text>
                    <Text style={styles.historyDate}>{new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(workout.completedAt))}</Text>
                  </View>
                  <Text style={styles.historyMeta}>{workout.durationMinutes} min · {workout.exerciseCount} ejercicios · {workout.setCount} series</Text>
                </Card>
              ))}
            </View>
          )}
        </View>
        <View style={styles.section}>
          <SectionTitle detail="DEMO · no calculado">Evolución</SectionTitle>
          <Card>
            <Text style={styles.demo}>Visual de referencia de Fase 1A</Text>
            <View style={styles.chart}>
              {bars.map((height, index) => <View key={index} style={styles.barColumn}><View style={[styles.bar, { height }]} /><Text style={styles.barLabel}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}</Text></View>)}
            </View>
          </Card>
        </View>
        <View style={styles.section}>
          <SectionTitle>RÉCORDS PERSONALES</SectionTitle>
          <Card style={styles.records}>
            {personalRecordDefinitions.map((definition) => {
              const record = personalRecords.find((item) => item.exerciseKey === definition.exerciseKey);
              return (
                <Record
                  exercise={definition.exerciseName}
                  key={definition.exerciseKey}
                  onEdit={() => openEditor(definition.exerciseKey)}
                  value={record && record.weightKg > 0 ? formatWeight(record.weightKg) : 'Pendiente'}
                />
              );
            })}
          </Card>
        </View>
        <View style={styles.section}>
          <SectionTitle detail={`${weeklyProgress.completed} de ${weeklyProgress.target} sesiones reales`}>Objetivo semanal</SectionTitle>
          <Card style={styles.goal}><Text style={styles.goalValue}>{Math.round(percentage)}%</Text><ProgressBar value={percentage} /></Card>
        </View>
      </Screen>
      <PersonalRecordEditorModal
        exerciseName={editingDefinition?.exerciseName ?? null}
        onCancel={() => setEditingKey(null)}
        onChange={setDraftWeightKg}
        onSave={() => void handleSave()}
        saving={saving}
        weightKg={draftWeightKg}
      />
    </>
  );
}

function Record({ exercise, value, onEdit }: { exercise: string; value: string; onEdit: () => void }) {
  return (
    <View style={styles.record}>
      <View style={styles.recordCopy}>
        <Text style={styles.exercise}>{exercise}</Text>
        <Text style={[styles.recordValue, value === 'Pendiente' && styles.pendingValue]}>{value}</Text>
      </View>
      <Pressable accessibilityLabel={`Editar récord de ${exercise}`} accessibilityRole="button" onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
        <Ionicons color={colors.primary} name="pencil-outline" size={16} />
        <Text style={styles.editText}>Editar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: spacing.md },
  metricCard: { flex: 1, padding: spacing.lg },
  section: { gap: spacing.md },
  list: { gap: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.text },
  emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  historyCard: { gap: spacing.sm },
  historyCopy: { gap: spacing.xs },
  historyTitle: { ...typography.heading, color: colors.text },
  historyDate: { ...typography.caption, color: colors.textMuted },
  historyMeta: { ...typography.caption, color: colors.primary },
  demo: { ...typography.label, color: colors.warning },
  chart: { height: 130, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.lg },
  barColumn: { alignItems: 'center', gap: spacing.sm },
  bar: { width: 16, borderRadius: 5, backgroundColor: colors.primary },
  barLabel: { ...typography.label, color: colors.textMuted },
  records: { paddingVertical: spacing.sm },
  record: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  recordCopy: { flex: 1, gap: spacing.xs },
  exercise: { ...typography.body, color: colors.text, fontWeight: '700' },
  recordValue: { ...typography.heading, color: colors.text },
  pendingValue: { color: colors.textMuted },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.primarySoft },
  editText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  goal: { gap: spacing.lg },
  goalValue: { ...typography.title, color: colors.primary },
  pressed: { opacity: 0.7 },
});
