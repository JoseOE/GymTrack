import { StyleSheet, Text, View } from 'react-native';

import { Card, Metric, ProgressBar, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { weeklyProgress } from '@/data/mockData';

const bars = [32, 54, 42, 76, 64, 92, 70];

export function ProgressScreen() {
  const progressPercentage = (weeklyProgress.completed / weeklyProgress.target) * 100;

  return (
    <Screen>
      <ScreenHeader title="Progreso" subtitle="Tu rendimiento este mes" />
      <View style={styles.metrics}><Card style={styles.metricCard}><Metric icon="checkmark-circle-outline" label="Entrenamientos" value="18" /></Card><Card style={styles.metricCard}><Metric icon="trending-up-outline" label="Volumen total" value="42,8 t" /></Card></View>
      <View style={styles.section}><SectionTitle detail="Últimos 7 días">Evolución</SectionTitle><Card><View style={styles.chartHeader}><View><Text style={styles.chartValue}>+12,4%</Text><Text style={styles.chartHint}>vs. semana anterior</Text></View></View><View style={styles.chart}>{bars.map((height, index) => <View key={index} style={styles.barColumn}><View style={[styles.bar, { height }]} /><Text style={styles.barLabel}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}</Text></View>)}</View></Card></View>
      <View style={styles.section}><SectionTitle>Récords personales</SectionTitle><Card style={styles.records}><Record exercise="Press banca" value="82,5 kg" change="+2,5 kg" /><Record exercise="Sentadilla" value="110 kg" change="+5 kg" /><Record exercise="Peso muerto" value="135 kg" change="+5 kg" /></Card></View>
      <View style={styles.section}><SectionTitle detail={`${weeklyProgress.completed} de ${weeklyProgress.target} sesiones`}>Objetivo semanal</SectionTitle><Card style={styles.goal}><View style={styles.goalCopy}><Text style={styles.goalValue}>{Math.round(progressPercentage)}%</Text><Text style={styles.goalText}>Te quedan {weeklyProgress.target - weeklyProgress.completed} sesiones para completar tu semana</Text></View><ProgressBar value={progressPercentage} /></Card></View>
    </Screen>
  );
}

function Record({ exercise, value, change }: { exercise: string; value: string; change: string }) { return <View style={styles.record}><View style={styles.recordCopy}><Text style={styles.exercise}>{exercise}</Text><Text style={styles.change}>{change}</Text></View><Text style={styles.recordValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: spacing.md }, metricCard: { flex: 1, padding: spacing.lg }, section: { gap: spacing.md }, chartHeader: { flexDirection: 'row', justifyContent: 'space-between' }, chartValue: { ...typography.title, color: colors.success }, chartHint: { ...typography.caption, color: colors.textMuted }, chart: { height: 130, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.xl }, barColumn: { alignItems: 'center', gap: spacing.sm }, bar: { width: 16, borderRadius: 5, backgroundColor: colors.primary }, barLabel: { ...typography.label, color: colors.textMuted }, records: { paddingVertical: spacing.sm }, record: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, recordCopy: { flex: 1 }, exercise: { ...typography.body, color: colors.text, fontWeight: '700' }, change: { ...typography.caption, color: colors.success }, recordValue: { ...typography.heading, color: colors.text }, goal: { gap: spacing.lg }, goalCopy: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, goalValue: { ...typography.title, color: colors.primary }, goalText: { ...typography.caption, color: colors.textMuted, flex: 1 },
});
