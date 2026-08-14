import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Screen, ScreenHeader } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { weekPlan } from '@/data/mockData';

export function CalendarScreen() {
  return (
    <Screen>
      <ScreenHeader title="Calendario" subtitle="Tu plan de esta semana" />
      <View style={styles.monthRow}><Ionicons color={colors.textMuted} name="chevron-back" size={20} /><Text style={styles.month}>12–18 AGOSTO</Text><Ionicons color={colors.textMuted} name="chevron-forward" size={20} /></View>
      <View style={styles.weekStrip}>{weekPlan.map((item) => <View key={item.day} style={[styles.date, item.status === 'today' && styles.dateToday]}><Text style={[styles.shortDay, item.status === 'today' && styles.todayText]}>{item.shortDay}</Text><Text style={[styles.dateNumber, item.status === 'today' && styles.todayText]}>{item.date}</Text></View>)}</View>
      <View style={styles.list}>{weekPlan.map((item) => <Card key={item.day} style={[styles.dayCard, item.status === 'today' && styles.todayCard]}><View style={[styles.status, item.status === 'completed' && styles.completed, item.status === 'today' && styles.active]}>{item.status === 'completed' ? <Ionicons color={colors.background} name="checkmark" size={16} /> : <View style={[styles.statusDot, item.status === 'today' && styles.statusDotActive]} />}</View><View style={styles.copy}><View style={styles.dayTitle}><Text style={styles.dayName}>{item.day}</Text>{item.status === 'today' ? <Text style={styles.todayLabel}>HOY</Text> : null}</View><Text style={[styles.workout, item.status === 'rest' && styles.rest]}>{item.workout}</Text>{item.duration ? <Text style={styles.duration}>{item.duration}</Text> : null}</View></Card>)}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xxl },
  month: { ...typography.label, color: colors.textMuted, letterSpacing: 1 },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { width: 40, paddingVertical: spacing.sm, alignItems: 'center', gap: spacing.xs, borderRadius: radii.md },
  dateToday: { backgroundColor: colors.primary },
  shortDay: { ...typography.label, color: colors.textMuted },
  dateNumber: { ...typography.body, color: colors.text, fontWeight: '700' },
  todayText: { color: colors.background },
  list: { gap: spacing.md },
  dayCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  todayCard: { borderColor: colors.primary },
  status: { width: 28, height: 28, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  completed: { backgroundColor: colors.primary, borderColor: colors.primary },
  active: { borderColor: colors.primary },
  statusDot: { width: 6, height: 6, borderRadius: radii.pill, backgroundColor: colors.textSubtle },
  statusDotActive: { backgroundColor: colors.primary },
  copy: { flex: 1 },
  dayTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayName: { ...typography.label, color: colors.textMuted },
  todayLabel: { ...typography.label, fontSize: 10, color: colors.primary },
  workout: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.xs },
  rest: { color: colors.textMuted },
  duration: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.xs },
});
