import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, ProgressBar, Screen, ScreenHeader, SecondaryButton } from '@/components/ui';
import { getDayMetadata } from '@/constants/workoutSchedule';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { getPlanForDate } from '@/services/weeklyPlanService';
import { WorkoutCompletedState } from '@/features/workout/WorkoutCompletedState';
import { WorkoutExerciseCard } from '@/features/workout/WorkoutExerciseCard';

function useElapsedMinutes(startedAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [startedAt]);
  if (!startedAt) return 0;
  return Math.max(1, Math.round((now - new Date(startedAt).getTime()) / 60000));
}

export function WorkoutScreen() {
  const { activeWorkout, addSet, beginWorkout, cancelActiveWorkout, completeWorkout, error, loading, localReady, pendingRoutine, refresh, removeSet, todayCompletedWorkout, updateSet, weeklyPlan } = useGymTrack();
  const { confirm, showToast } = useFeedback();
  const [working, setWorking] = useState(false);
  const elapsed = useElapsedMinutes(activeWorkout?.startedAt ?? null);
  const todaySchedule = weeklyPlan ? getPlanForDate(weeklyPlan, new Date()) : null;

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const start = async (allowRest = false) => {
    setWorking(true);
    try { await beginWorkout({ allowRest }); }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo iniciar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
    finally { setWorking(false); }
  };
  const requestAdditional = () => confirm({ title: '¿Iniciar otro entrenamiento?', message: 'Ya completaste tu sesión de hoy. Esta nueva sesión se registrará como un entrenamiento adicional.', confirmLabel: 'Iniciar', cancelLabel: 'Cancelar', tone: 'warning', icon: 'add-circle-outline', onConfirm: async () => { await beginWorkout({ allowRest: true }); showToast({ type: 'info', title: 'Entrenamiento adicional', message: 'La nueva sesión ya está activa.' }); } });
  const requestFinish = () => {
    if (!activeWorkout) return;
    confirm({ title: '¿Finalizar entrenamiento?', message: 'Guardaremos tus series, peso y repeticiones en tu historial.', confirmLabel: 'Finalizar', cancelLabel: 'Seguir entrenando', icon: 'checkmark-circle-outline', onConfirm: async () => { await completeWorkout(activeWorkout.id); showToast({ type: 'success', title: 'Entrenamiento completado', message: 'Tu sesión ya está disponible en Progreso.' }); } });
  };
  const requestCancel = () => {
    if (!activeWorkout) return;
    confirm({ title: '¿Cancelar entrenamiento?', message: 'Esta sesión no contará en tu progreso semanal.', confirmLabel: 'Cancelar entrenamiento', cancelLabel: 'Volver', tone: 'danger', icon: 'close-circle-outline', onConfirm: async () => { await cancelActiveWorkout(activeWorkout.id); showToast({ type: 'info', title: 'Entrenamiento cancelado', message: 'La sesión no contará en tu progreso.' }); } });
  };
  const handleAddSet = async (workoutExerciseId: string) => { await addSet(workoutExerciseId); showToast({ type: 'info', title: 'Serie agregada' }); };
  const handleRemoveSet = async (setId: string) => {
    const result = await removeSet(setId);
    if (result === 'last-set') showToast({ type: 'warning', title: 'No puedes eliminar la última serie' });
    if (result === 'completed') showToast({ type: 'warning', title: 'Serie completada', message: 'Desmárcala antes de eliminarla.' });
    return result;
  };

  if (loading) return <Screen key="loading"><ScreenHeader title="Entrenar" subtitle="Preparando tu sesión local" /><Card style={styles.centerCard}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.emptyText}>Cargando entrenamiento…</Text></Card></Screen>;
  if (activeWorkout) {
    const sets = activeWorkout.exercises.flatMap((exercise) => exercise.sets);
    const completed = sets.filter((set) => set.completed).length;
    return <Screen key={`active-${activeWorkout.id}`}><ScreenHeader title="Entrenar" subtitle={`${activeWorkout.sessionName} · ${elapsed} min`} /><View style={styles.summary}><Text style={styles.summaryText}>{completed} / {sets.length} series</Text><ProgressBar value={sets.length ? (completed / sets.length) * 100 : 0} /></View>{activeWorkout.exercises.length === 0 ? <Card style={styles.errorCard}><Ionicons color={colors.danger} name="alert-circle-outline" size={30} /><Text style={styles.emptyTitle}>La sesión activa no tiene ejercicios</Text><Text style={styles.emptyText}>Puedes cancelarla de forma segura y volver a iniciar.</Text></Card> : <View style={styles.list}>{activeWorkout.exercises.map((exercise, index) => <WorkoutExerciseCard exercise={exercise} index={index} key={exercise.id} onAddSet={() => handleAddSet(exercise.id)} onRemoveSet={handleRemoveSet} onUpdateSet={updateSet} />)}</View>}<PrimaryButton disabled={activeWorkout.exercises.length === 0} icon="checkmark-circle-outline" loading={working} title="Finalizar entrenamiento" onPress={requestFinish} /><SecondaryButton icon="close-circle-outline" title="Cancelar entrenamiento" tone="danger" onPress={requestCancel} /></Screen>;
  }
  if (todayCompletedWorkout && weeklyPlan) return <WorkoutCompletedState onAdditional={requestAdditional} weeklyPlan={weeklyPlan} workout={todayCompletedWorkout} />;
  if (error) return <Screen key="error"><ScreenHeader title="Entrenar" subtitle="No pudimos cargar tu estado" /><Card style={styles.errorCard}><Ionicons color={colors.danger} name="alert-circle-outline" size={34} /><Text style={styles.emptyTitle}>Ocurrió un problema</Text><Text style={styles.emptyText}>{error}</Text></Card><PrimaryButton icon="refresh" title="Reintentar" onPress={() => void refresh()} /></Screen>;
  if (!todaySchedule) return <Screen key="missing-plan"><ScreenHeader title="Entrenar" subtitle="Plan semanal no disponible" /><PrimaryButton icon="refresh" title="Reintentar" onPress={() => void refresh()} /></Screen>;
  const metadata = getDayMetadata(todaySchedule.dayIndex);
  if (todaySchedule.sessionType === 'rest') return <Screen key="rest"><ScreenHeader title="Entrenar" subtitle={metadata.dayName} /><Card style={styles.centerCard}><View style={styles.restIcon}><Ionicons color={colors.textMuted} name="moon-outline" size={38} /></View><Text style={styles.emptyTitle}>Día de descanso</Text><Text style={styles.emptyText}>Hoy toca recuperar. Tu próximo entrenamiento está en el plan semanal.</Text></Card></Screen>;
  const plannedName = pendingRoutine?.name ?? todaySchedule.displayName;
  const plannedMinutes = pendingRoutine?.estimatedMinutes ?? todaySchedule.estimatedMinutes;
  return <Screen key="not-started"><ScreenHeader title="Entrenar" subtitle={`${metadata.dayName} · ${pendingRoutine ? 'Rutina aceptada' : 'Tu plan de hoy'}`} /><Card style={styles.empty}><Text style={styles.planLabel}>{pendingRoutine ? 'RUTINA ACEPTADA' : todaySchedule.isOptional ? 'SESIÓN OPCIONAL' : 'ENTRENAMIENTO DE HOY'}</Text><Text style={styles.emptyTitle}>{plannedName}</Text><Text style={styles.emptyText}>{pendingRoutine ? `Usaremos los ${pendingRoutine.exerciseCount} ejercicios que guardaste en Coach.` : 'Crearemos una sesión coherente con estos músculos usando tu catálogo local.'}</Text>{plannedMinutes ? <Text style={styles.duration}>{plannedMinutes} min estimados</Text> : null}</Card><PrimaryButton disabled={!localReady || !weeklyPlan} loading={working} title={todaySchedule.isOptional && !pendingRoutine ? 'Iniciar sesión opcional' : 'Iniciar entrenamiento'} onPress={() => void start()} /></Screen>;
}

const styles = StyleSheet.create({
  summary: { gap: spacing.sm }, summaryText: { ...typography.caption, color: colors.textMuted, textAlign: 'right' }, list: { gap: spacing.lg }, empty: { gap: spacing.sm }, centerCard: { alignItems: 'center', gap: spacing.md }, errorCard: { alignItems: 'center', gap: spacing.sm, borderColor: `${colors.danger}70` }, emptyTitle: { ...typography.heading, color: colors.text, textAlign: 'center' }, emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' }, planLabel: { ...typography.label, color: colors.primary, letterSpacing: 0.8 }, duration: { ...typography.caption, color: colors.primary, marginTop: spacing.sm }, restIcon: { width: 68, height: 68, borderRadius: radii.pill, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
});
