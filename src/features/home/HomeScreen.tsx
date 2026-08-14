import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, Metric, PrimaryButton, ProgressBar, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { getDefaultExerciseCount, getPlanForDate } from '@/services/weeklyPlanService';

const dayOrder = [1, 2, 3, 4, 5, 6, 0];

export function HomeScreen() {
  const { activeWorkout, beginWorkout, initializing, localReady, pendingRoutine, profile, refreshing, todayCompletedWorkout, weeklyPlan, weeklyProgress } = useGymTrack();
  const { showToast } = useFeedback();
  const [starting, setStarting] = useState(false);
  const now = new Date();
  const today = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  if (!weeklyPlan) return <Screen><ScreenHeader title="GymTrack" subtitle={initializing || refreshing ? 'Cargando tu plan semanal…' : 'Plan semanal no disponible'} /></Screen>;
  const schedule = getPlanForDate(weeklyPlan, now);
  const isRest = schedule.sessionType === 'rest';
  const percentage = weeklyProgress.target ? Math.min(100, Math.max(0, (weeklyProgress.completed / weeklyProgress.target) * 100)) : 0;
  const plannedName = pendingRoutine && !isRest ? pendingRoutine.name : schedule.displayName;
  const plannedMinutes = pendingRoutine && !isRest ? pendingRoutine.estimatedMinutes : schedule.estimatedMinutes;
  const plannedExercises = pendingRoutine && !isRest ? pendingRoutine.exerciseCount : getDefaultExerciseCount(schedule);

  const handleWorkout = async () => {
    if (!localReady || !weeklyPlan) { showToast({ type: 'warning', title: 'Datos en preparación', message: 'Los datos de tu cuenta todavía se están preparando.' }); return; }
    if (activeWorkout || todayCompletedWorkout) { router.navigate('/(tabs)/workout'); return; }
    if (isRest) { router.push('/calendar'); return; }
    setStarting(true);
    try {
      const workout = await beginWorkout();
      if (workout.exercises.length === 0) throw new Error('La sesión no contiene ejercicios para comenzar.');
      router.navigate('/(tabs)/workout');
    }
    catch (reason) { showToast({ type: 'error', title: 'No se pudo iniciar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); }
    finally { setStarting(false); }
  };

  const heroName = activeWorkout?.sessionName ?? (todayCompletedWorkout ? 'Entrenamiento completado' : plannedName);
  const eyebrow = activeWorkout ? 'SESIÓN ACTIVA' : todayCompletedWorkout ? 'OBJETIVO DE HOY COMPLETADO' : isRest ? 'PLAN DE HOY' : pendingRoutine ? 'RUTINA ACEPTADA' : schedule.isOptional ? 'SESIÓN OPCIONAL' : 'ENTRENAMIENTO DE HOY';
  const description = activeWorkout ? 'Guardado automáticamente en este dispositivo' : todayCompletedWorkout ? todayCompletedWorkout.title : isRest ? 'Recuperación y descanso' : pendingRoutine ? 'Guardada desde Coach' : 'Plan semanal personalizado';
  const primaryTitle = activeWorkout ? 'Continuar entrenamiento' : todayCompletedWorkout ? 'Ver resumen de hoy' : isRest ? 'Ver plan semanal' : schedule.isOptional ? 'Iniciar sesión opcional' : 'Iniciar entrenamiento';
  const primaryIcon = isRest && !activeWorkout && !todayCompletedWorkout ? 'calendar-outline' : todayCompletedWorkout ? 'checkmark-circle-outline' : 'play';

  return (
    <Screen>
      <ScreenHeader title="GymTrack" subtitle={`${profile?.displayName ? `Hola, ${profile.displayName} · ` : ''}${today}`} action={<IconButton icon="person-outline" label="Abrir perfil y configuración" onPress={() => router.push('/profile')} />} />
      <Card style={styles.hero}>
        <View style={styles.eyebrow}><View style={styles.dot} /><Text style={styles.eyebrowText}>{eyebrow}</Text></View>
        <Text style={styles.workout}>{heroName}</Text><Text style={styles.description}>{description}</Text>
        <View style={styles.metrics}>
          <Metric icon="time-outline" label={activeWorkout ? 'Estado' : 'Duración'} value={activeWorkout ? 'En curso' : todayCompletedWorkout ? `${todayCompletedWorkout.durationMinutes} min` : plannedMinutes ? `${plannedMinutes} min` : 'Descanso'} />
          <View style={styles.divider} />
          <Metric icon="barbell-outline" label="Ejercicios" value={String(activeWorkout?.exercises.length ?? todayCompletedWorkout?.exerciseCount ?? plannedExercises)} />
        </View>
        <PrimaryButton disabled={!localReady || !weeklyPlan} icon={primaryIcon} loading={refreshing || starting} title={primaryTitle} onPress={() => void handleWorkout()} />
      </Card>
      <View style={styles.section}><SectionTitle detail={`${weeklyProgress.completed} de ${weeklyProgress.target} sesiones reales`}>Progreso semanal</SectionTitle><Card><View style={styles.progressCopy}><Text style={styles.progressValue}>{Math.round(percentage)}%</Text><Text style={styles.progressHint}>{weeklyProgress.completed ? 'Cada marca viene de tu historial local.' : 'Completa una sesión para comenzar.'}</Text></View><ProgressBar value={percentage} /><View style={styles.days}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => { const completed = weeklyProgress.completedDays.includes(dayOrder[index]); return <View key={day} style={styles.day}><View style={[styles.dayCircle, completed && styles.dayComplete]}>{completed ? <Ionicons color={colors.background} name="checkmark" size={15} /> : null}</View><Text style={styles.dayLabel}>{day}</Text></View>; })}</View></Card></View>
    </Screen>
  );
}

const styles = StyleSheet.create({ hero: { gap: spacing.lg }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, dot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.primary }, eyebrowText: { ...typography.label, color: colors.primary, letterSpacing: 0.8 }, workout: { ...typography.title, color: colors.text }, description: { ...typography.body, color: colors.textMuted, marginTop: -spacing.sm }, metrics: { flexDirection: 'row', marginVertical: spacing.sm }, divider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl }, section: { gap: spacing.md }, progressCopy: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md, marginBottom: spacing.md }, progressValue: { ...typography.title, color: colors.text }, progressHint: { ...typography.caption, color: colors.textMuted, flex: 1 }, days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl }, day: { alignItems: 'center', gap: spacing.sm }, dayCircle: { width: 28, height: 28, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, dayComplete: { backgroundColor: colors.primary, borderColor: colors.primary }, dayLabel: { ...typography.label, color: colors.textMuted } });
