import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, Metric, PrimaryButton, ProgressBar, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useGymTrack } from '@/providers/GymTrackProvider';

const dayOrder = [1, 2, 3, 4, 5, 6, 0];

export function HomeScreen() {
  const { activeWorkout, beginWorkout, loading, profile, weeklyProgress } = useGymTrack();
  const [starting, setStarting] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const today = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const handleWorkout = async () => {
    if (activeWorkout) { router.push('/workout'); return; }
    setStarting(true);
    try { await beginWorkout(); router.push('/workout'); } catch (reason) { Alert.alert('No se pudo iniciar', reason instanceof Error ? reason.message : 'Inténtalo nuevamente.'); } finally { setStarting(false); }
  };
  const percentage = (weeklyProgress.completed / weeklyProgress.target) * 100;
  return <Screen><ScreenHeader title="GymTrack" subtitle={`${profile?.displayName ? `Hola, ${profile.displayName} · ` : ''}${today}`} action={<IconButton icon="person-outline" label="Abrir perfil y configuración" onPress={() => router.push('/profile')} />} /><Card style={styles.hero}><View style={styles.eyebrow}><View style={styles.dot} /><Text style={styles.eyebrowText}>{activeWorkout ? 'SESIÓN ACTIVA' : 'ENTRENAMIENTO SUGERIDO · DEMO'}</Text></View><Text style={styles.workout}>{activeWorkout?.routineName ?? (activeWorkout ? 'Sesión libre' : 'Pierna completa')}</Text><Text style={styles.description}>{activeWorkout ? 'Guardado automáticamente en este dispositivo' : 'Plan visual de Fase 1A'}</Text><View style={styles.metrics}><Metric icon="time-outline" label="Duración" value={activeWorkout ? `${Math.max(1, Math.round((renderedAt - new Date(activeWorkout.startedAt).getTime()) / 60000))} min` : `${profile?.defaultWorkoutMinutes ?? 60} min`} /><View style={styles.divider} /><Metric icon="barbell-outline" label="Ejercicios" value={String(activeWorkout?.exercises.length ?? 6)} /></View><PrimaryButton loading={loading || starting} title={activeWorkout ? 'Continuar entrenamiento' : 'Iniciar entrenamiento'} onPress={() => void handleWorkout()} /></Card><View style={styles.section}><SectionTitle detail={`${weeklyProgress.completed} de ${weeklyProgress.target} sesiones reales`}>Progreso semanal</SectionTitle><Card><View style={styles.progressCopy}><Text style={styles.progressValue}>{Math.round(percentage)}%</Text><Text style={styles.progressHint}>{weeklyProgress.completed ? 'Cada marca viene de tu historial local.' : 'Completa una sesión para comenzar.'}</Text></View><ProgressBar value={percentage} /><View style={styles.days}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => { const completed = weeklyProgress.completedDays.includes(dayOrder[index]); return <View key={day} style={styles.day}><View style={[styles.dayCircle, completed && styles.dayComplete]}>{completed ? <Ionicons color={colors.background} name="checkmark" size={15} /> : null}</View><Text style={styles.dayLabel}>{day}</Text></View>; })}</View></Card></View></Screen>;
}

const styles = StyleSheet.create({ hero: { gap: spacing.lg }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, dot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.primary }, eyebrowText: { ...typography.label, color: colors.primary, letterSpacing: 0.8 }, workout: { ...typography.title, color: colors.text }, description: { ...typography.body, color: colors.textMuted, marginTop: -spacing.sm }, metrics: { flexDirection: 'row', marginVertical: spacing.sm }, divider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl }, section: { gap: spacing.md }, progressCopy: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md, marginBottom: spacing.md }, progressValue: { ...typography.title, color: colors.text }, progressHint: { ...typography.caption, color: colors.textMuted, flex: 1 }, days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl }, day: { alignItems: 'center', gap: spacing.sm }, dayCircle: { width: 28, height: 28, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, dayComplete: { backgroundColor: colors.primary, borderColor: colors.primary }, dayLabel: { ...typography.label, color: colors.textMuted } });
