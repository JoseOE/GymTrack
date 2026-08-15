import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, ProgressBar, Screen, ScreenHeader, SecondaryButton } from '@/components/ui';
import { getDayMetadata } from '@/constants/workoutSchedule';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { getPlanForDate } from '@/services/weeklyPlanService';
import { WorkoutCompletedState } from '@/features/workout/WorkoutCompletedState';
import { WorkoutExerciseCard } from '@/features/workout/WorkoutExerciseCard';
import { CardioWorkoutCard } from '@/features/workout/CardioWorkoutCard';
import type { WorkoutExercise } from '@/domain/models';
import { formatDuration } from '@/utils/duration';
import { getCardioElapsedSeconds } from '@/utils/cardioTimer';

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
  const {
    activeWorkout, addSet, beginWorkout, cancelActiveWorkout, completeWorkout, error, finishCardio, initializing,
    localReady, pauseCardio, pendingRoutine, refresh, refreshing, removeSet, resumeCardio, startCardio,
    syncCardioTimers, todayCompletedWorkout, updateSet, weeklyPlan,
  } = useGymTrack();
  const { confirm, showToast } = useFeedback();
  const [working, setWorking] = useState(false);
  const syncCardioTimersRef = useRef(syncCardioTimers);
  const activeWorkoutId = activeWorkout?.id ?? null;
  const elapsed = useElapsedMinutes(activeWorkout?.startedAt ?? null);
  const todaySchedule = weeklyPlan ? getPlanForDate(weeklyPlan, new Date()) : null;

  useEffect(() => { syncCardioTimersRef.current = syncCardioTimers; }, [syncCardioTimers]);

  useFocusEffect(useCallback(() => {
    if (!localReady) return;
    if (activeWorkoutId) {
      void syncCardioTimersRef.current().then((completed) => {
        if (completed) showToast({ type: 'success', title: 'Cardio completado' });
      });
      return;
    }
    if (!todayCompletedWorkout) void refresh();
  }, [activeWorkoutId, localReady, refresh, showToast, todayCompletedWorkout]));

  useEffect(() => {
    if (!localReady || !activeWorkoutId) return undefined;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void syncCardioTimersRef.current().then((completed) => {
        if (completed) showToast({ type: 'success', title: 'Cardio completado' });
      });
    });
    return () => subscription.remove();
  }, [activeWorkoutId, localReady, showToast]);

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
  const runCardioAction = async (action: () => Promise<void>) => {
    try { await action(); }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo actualizar Cardio', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
  };
  const completeExpiredCardio = async () => {
    const completed = await syncCardioTimers();
    if (completed) showToast({ type: 'success', title: 'Cardio completado' });
  };
  const requestFinishCardio = (exercise: WorkoutExercise) => {
    const elapsedSeconds = getCardioElapsedSeconds({
      state: exercise.cardioTimerState,
      targetDurationMinutes: exercise.targetDurationMinutes ?? 0,
      elapsedSeconds: exercise.cardioElapsedSeconds,
      lastStartedAt: exercise.cardioLastStartedAt,
    });
    confirm({
      title: '¿Finalizar Cardio?',
      message: `Realizado: aproximadamente ${formatDuration(elapsedSeconds / 60)}. Objetivo: ${formatDuration(exercise.targetDurationMinutes ?? 0)}.`,
      confirmLabel: 'Finalizar',
      cancelLabel: 'Seguir',
      icon: 'stop-circle-outline',
      onConfirm: async () => {
        const savedElapsed = await finishCardio(exercise.id);
        showToast({ type: 'success', title: 'Cardio completado', message: `Registramos aproximadamente ${formatDuration(savedElapsed / 60)}.` });
      },
    });
  };

  if (initializing || refreshing) return <Screen key="loading"><ScreenHeader title="Entrenar" subtitle={initializing ? 'Preparando tu sesión local' : 'Actualizando tu sesión'} /><Card style={styles.centerCard}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.emptyText}>{initializing ? 'Cargando entrenamiento…' : 'Comprobando cambios locales…'}</Text></Card></Screen>;
  if (activeWorkout) {
    const strengthSets = activeWorkout.exercises.filter((exercise) => exercise.mode === 'strength').flatMap((exercise) => exercise.sets);
    const cardioExercises = activeWorkout.exercises.filter((exercise) => exercise.mode === 'cardio');
    const totalUnits = strengthSets.length + cardioExercises.length;
    const completedUnits = strengthSets.filter((set) => set.completed).length + cardioExercises.filter((exercise) => exercise.cardioCompleted).length;
    return <Screen key={`active-${activeWorkout.id}`}><ScreenHeader title="Entrenar" subtitle={`${activeWorkout.sessionName} · ${formatDuration(elapsed)}`} /><View style={styles.summary}><Text style={styles.summaryText}>{completedUnits} / {totalUnits} unidades completadas</Text><ProgressBar value={totalUnits ? (completedUnits / totalUnits) * 100 : 0} /></View>{activeWorkout.exercises.length === 0 ? <Card style={styles.errorCard}><Ionicons color={colors.danger} name="alert-circle-outline" size={30} /><Text style={styles.emptyTitle}>La sesión activa no tiene ejercicios</Text><Text style={styles.emptyText}>Puedes cancelarla de forma segura y volver a iniciar.</Text></Card> : <View style={styles.list}>{activeWorkout.exercises.map((exercise, index) => exercise.mode === 'cardio' ? <CardioWorkoutCard exercise={exercise} index={index} key={exercise.id} onExpire={completeExpiredCardio} onFinish={() => requestFinishCardio(exercise)} onPause={() => runCardioAction(() => pauseCardio(exercise.id))} onResume={() => runCardioAction(() => resumeCardio(exercise.id))} onStart={() => runCardioAction(() => startCardio(exercise.id))} /> : <WorkoutExerciseCard exercise={exercise} index={index} key={exercise.id} onAddSet={() => handleAddSet(exercise.id)} onRemoveSet={handleRemoveSet} onUpdateSet={updateSet} />)}</View>}<PrimaryButton disabled={activeWorkout.exercises.length === 0} icon="checkmark-circle-outline" loading={working} title="Finalizar entrenamiento" onPress={requestFinish} /><SecondaryButton icon="close-circle-outline" title="Cancelar entrenamiento" tone="danger" onPress={requestCancel} /></Screen>;
  }
  if (todayCompletedWorkout && weeklyPlan) return <WorkoutCompletedState onAdditional={requestAdditional} weeklyPlan={weeklyPlan} workout={todayCompletedWorkout} />;
  if (error) return <Screen key="error"><ScreenHeader title="Entrenar" subtitle="No pudimos cargar tu estado" /><Card style={styles.errorCard}><Ionicons color={colors.danger} name="alert-circle-outline" size={34} /><Text style={styles.emptyTitle}>Ocurrió un problema</Text><Text style={styles.emptyText}>{error}</Text></Card><PrimaryButton icon="refresh" title="Reintentar" onPress={() => void refresh()} /></Screen>;
  if (!todaySchedule) return <Screen key="missing-plan"><ScreenHeader title="Entrenar" subtitle="Plan semanal no disponible" /><PrimaryButton icon="refresh" title="Reintentar" onPress={() => void refresh()} /></Screen>;
  const metadata = getDayMetadata(todaySchedule.dayIndex);
  if (todaySchedule.sessionType === 'rest') return <Screen key="rest"><ScreenHeader title="Entrenar" subtitle={metadata.dayName} /><Card style={styles.centerCard}><View style={styles.restIcon}><Ionicons color={colors.textMuted} name="moon-outline" size={38} /></View><Text style={styles.emptyTitle}>Día de descanso</Text><Text style={styles.emptyText}>Hoy toca recuperar. Tu próximo entrenamiento está en el plan semanal.</Text></Card></Screen>;
  const plannedName = pendingRoutine?.name ?? todaySchedule.displayName;
  const plannedMinutes = pendingRoutine?.estimatedMinutes ?? todaySchedule.estimatedMinutes;
  return <Screen key="not-started"><ScreenHeader title="Entrenar" subtitle={`${metadata.dayName} · ${pendingRoutine ? 'Rutina aceptada' : 'Tu plan de hoy'}`} /><Card style={styles.empty}><Text style={styles.planLabel}>{pendingRoutine ? 'RUTINA ACEPTADA' : todaySchedule.isOptional ? 'SESIÓN OPCIONAL' : 'ENTRENAMIENTO DE HOY'}</Text><Text style={styles.emptyTitle}>{plannedName}</Text><Text style={styles.emptyText}>{pendingRoutine ? `Usaremos los ${pendingRoutine.exerciseCount} ejercicios que guardaste en Coach.` : 'Crearemos una sesión coherente con estos músculos usando tu catálogo local.'}</Text>{plannedMinutes ? <Text style={styles.duration}>{formatDuration(plannedMinutes)} estimados</Text> : null}</Card><PrimaryButton disabled={!localReady || !weeklyPlan} loading={working} title={todaySchedule.isOptional && !pendingRoutine ? 'Iniciar sesión opcional' : 'Iniciar entrenamiento'} onPress={() => void start()} /></Screen>;
}

const styles = StyleSheet.create({
  summary: { gap: spacing.sm }, summaryText: { ...typography.caption, color: colors.textMuted, textAlign: 'right' }, list: { gap: spacing.lg }, empty: { gap: spacing.sm }, centerCard: { alignItems: 'center', gap: spacing.md }, errorCard: { alignItems: 'center', gap: spacing.sm, borderColor: `${colors.danger}70` }, emptyTitle: { ...typography.heading, color: colors.text, textAlign: 'center' }, emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' }, planLabel: { ...typography.label, color: colors.primary, letterSpacing: 0.8 }, duration: { ...typography.caption, color: colors.primary, marginTop: spacing.sm }, restIcon: { width: 68, height: 68, borderRadius: radii.pill, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
});
