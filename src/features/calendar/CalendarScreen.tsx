import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Screen, ScreenHeader } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useGymTrack } from '@/providers/GymTrackProvider';

const workouts = [
  ['Pierna completa', '75 min'], ['Espalda + Bíceps + Antebrazo', '65 min'], ['Pecho + Tríceps', '55 min'],
  ['Hombro + Bíceps + Tríceps', '70 min'], ['Pecho + Espalda', '60 min'], ['Cardio opcional', '30 min'], ['Descanso', ''],
] as const;
const shortDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }

export function CalendarScreen() {
  const { completedDates } = useGymTrack();
  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => {
    const monday = new Date();
    const weekday = monday.getDay() || 7;
    monday.setDate(monday.getDate() - weekday + 1 + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
  }, [weekOffset]);
  const completedKeys = new Set(completedDates.map((value) => dateKey(new Date(value))));
  const todayKey = dateKey(new Date());
  const range = `${days[0].getDate()}–${days[6].getDate()} ${new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(days[6]).toUpperCase()}`;
  return <Screen><ScreenHeader title="Calendario" subtitle="Plan semanal · sesiones registradas en verde" /><View style={styles.monthRow}><Pressable accessibilityLabel="Semana anterior" onPress={() => setWeekOffset((value) => value - 1)} style={({ pressed }) => pressed && styles.pressed}><Ionicons color={colors.textMuted} name="chevron-back" size={22} /></Pressable><Text style={styles.month}>{range}</Text><Pressable accessibilityLabel="Semana siguiente" onPress={() => setWeekOffset((value) => value + 1)} style={({ pressed }) => pressed && styles.pressed}><Ionicons color={colors.textMuted} name="chevron-forward" size={22} /></Pressable></View><View style={styles.weekStrip}>{days.map((date, index) => { const today = dateKey(date) === todayKey; return <View key={dateKey(date)} style={[styles.date, today && styles.dateToday]}><Text style={[styles.shortDay, today && styles.todayText]}>{shortDays[index]}</Text><Text style={[styles.dateNumber, today && styles.todayText]}>{date.getDate()}</Text></View>; })}</View><View style={styles.list}>{days.map((date, index) => { const trained = completedKeys.has(dateKey(date)); const today = dateKey(date) === todayKey; const [workout, duration] = workouts[index]; return <Card key={dateKey(date)} style={[styles.dayCard, today && styles.todayCard]}><View style={[styles.status, trained && styles.completed, today && !trained && styles.active]}>{trained ? <Ionicons color={colors.background} name="checkmark" size={16} /> : <View style={[styles.statusDot, today && styles.statusDotActive]} />}</View><View style={styles.copy}><View style={styles.dayTitle}><Text style={styles.dayName}>{new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(date)}</Text>{today ? <Text style={styles.todayLabel}>HOY</Text> : null}{trained ? <Text style={styles.trainedLabel}>REGISTRADO</Text> : <Text style={styles.planLabel}>PLAN DEMO</Text>}</View><Text style={[styles.workout, workout === 'Descanso' && styles.rest]}>{workout}</Text>{duration ? <Text style={styles.duration}>{duration}</Text> : null}</View></Card>; })}</View></Screen>;
}

const styles = StyleSheet.create({ monthRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xl }, month: { ...typography.label, color: colors.textMuted, letterSpacing: 0.6, minWidth: 210, textAlign: 'center' }, pressed: { opacity: 0.5 }, weekStrip: { flexDirection: 'row', justifyContent: 'space-between' }, date: { width: 40, paddingVertical: spacing.sm, alignItems: 'center', gap: spacing.xs, borderRadius: radii.md }, dateToday: { backgroundColor: colors.primary }, shortDay: { ...typography.label, color: colors.textMuted }, dateNumber: { ...typography.body, color: colors.text, fontWeight: '700' }, todayText: { color: colors.background }, list: { gap: spacing.md }, dayCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg }, todayCard: { borderColor: colors.primary }, status: { width: 28, height: 28, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }, completed: { backgroundColor: colors.primary, borderColor: colors.primary }, active: { borderColor: colors.primary }, statusDot: { width: 6, height: 6, borderRadius: radii.pill, backgroundColor: colors.textSubtle }, statusDotActive: { backgroundColor: colors.primary }, copy: { flex: 1 }, dayTitle: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }, dayName: { ...typography.label, color: colors.textMuted, textTransform: 'capitalize' }, todayLabel: { ...typography.label, fontSize: 10, color: colors.primary }, trainedLabel: { ...typography.label, fontSize: 10, color: colors.success }, planLabel: { ...typography.label, fontSize: 9, color: colors.textSubtle }, workout: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.xs }, rest: { color: colors.textMuted }, duration: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.xs } });
