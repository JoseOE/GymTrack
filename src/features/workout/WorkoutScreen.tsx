import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, ProgressBar, Screen, ScreenHeader } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { WorkoutExerciseCard } from '@/features/workout/WorkoutExerciseCard';

export function WorkoutScreen() {
  const { activeWorkout, addSet, beginWorkout, completeWorkout, error, loading, removeSet, updateSet } = useGymTrack();
  const [working, setWorking] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const start = async () => { setWorking(true); try { await beginWorkout(); } catch (reason) { Alert.alert('No se pudo iniciar', reason instanceof Error ? reason.message : 'Inténtalo nuevamente.'); } finally { setWorking(false); } };
  const finish = () => {
    if (!activeWorkout) return;
    Alert.alert('Finalizar entrenamiento', 'La sesión y todas sus series quedarán guardadas en el historial.', [
      { text: 'Seguir entrenando', style: 'cancel' },
      { text: 'Finalizar', onPress: () => { setWorking(true); void completeWorkout(activeWorkout.id).then(() => { Alert.alert('Entrenamiento guardado', 'Tu sesión ya aparece en Progreso.'); router.push('/progress'); }).catch((reason: unknown) => Alert.alert('No se pudo finalizar', reason instanceof Error ? reason.message : 'Inténtalo nuevamente.')).finally(() => setWorking(false)); } },
    ]);
  };

  if (loading) return <Screen><ScreenHeader title="Entrenar" subtitle="Cargando sesión local…" /></Screen>;
  if (!activeWorkout) return <Screen><ScreenHeader title="Entrenar" subtitle="No hay una sesión activa" /><Card style={styles.empty}><Text style={styles.emptyTitle}>Todo listo para entrenar</Text><Text style={styles.emptyText}>Se usará tu rutina local más reciente. Si aún no tienes una, iniciaremos una sesión base de espalda y bíceps.</Text></Card>{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton loading={working} title="Iniciar entrenamiento" onPress={() => void start()} /></Screen>;

  const sets = activeWorkout.exercises.flatMap((exercise) => exercise.sets);
  const completed = sets.filter((set) => set.completed).length;
  const elapsed = Math.max(1, Math.round((renderedAt - new Date(activeWorkout.startedAt).getTime()) / 60000));
  return <Screen><ScreenHeader title="Entrenar" subtitle={`${activeWorkout.routineName ?? 'Sesión libre'} · ${elapsed} min`} /><View style={styles.summary}><Text style={styles.summaryText}>{completed} / {sets.length} series</Text><ProgressBar value={sets.length ? (completed / sets.length) * 100 : 0} /></View><View style={styles.list}>{activeWorkout.exercises.map((exercise, index) => <WorkoutExerciseCard exercise={exercise} index={index} key={exercise.id} onAddSet={() => addSet(exercise.id)} onRemoveSet={removeSet} onUpdateSet={updateSet} />)}</View><PrimaryButton icon="checkmark-circle-outline" loading={working} title="Finalizar entrenamiento" onPress={finish} /></Screen>;
}

const styles = StyleSheet.create({ summary: { gap: spacing.sm }, summaryText: { ...typography.caption, color: colors.textMuted, textAlign: 'right' }, list: { gap: spacing.lg }, empty: { gap: spacing.sm }, emptyTitle: { ...typography.heading, color: colors.text }, emptyText: { ...typography.body, color: colors.textMuted }, error: { ...typography.caption, color: colors.danger } });
