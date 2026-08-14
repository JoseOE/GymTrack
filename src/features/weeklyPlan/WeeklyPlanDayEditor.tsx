import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, SectionTitle } from '@/components/ui';
import { getDayMetadata } from '@/constants/workoutSchedule';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { MuscleGroup, WeeklyPlanDayDraft, WeeklyPlanSessionType } from '@/domain/models';
import { derivePlanDayDisplayName } from '@/services/weeklyPlanService';

const durations = [30, 45, 60, 75, 90];
const sessionTypes: { value: WeeklyPlanSessionType; label: string }[] = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'rest', label: 'Descanso' },
];

export function WeeklyPlanDayEditor({ day, muscleGroups, onChange }: { day: WeeklyPlanDayDraft; muscleGroups: MuscleGroup[]; onChange: (day: WeeklyPlanDayDraft) => void }) {
  const metadata = getDayMetadata(day.dayIndex);
  const update = (changes: Partial<WeeklyPlanDayDraft>) => {
    const next = { ...day, ...changes };
    onChange({ ...next, displayName: derivePlanDayDisplayName(next) });
  };
  const changeType = (sessionType: WeeklyPlanSessionType) => {
    if (sessionType === 'rest') {
      update({ sessionType, muscles: [], estimatedMinutes: null, isOptional: false, countsTowardGoal: false, targetExerciseCount: null });
      return;
    }
    if (sessionType === 'cardio') {
      const cardio = muscleGroups.find((muscle) => muscle.id === 'cardio');
      update({ sessionType, muscles: cardio ? [{ ...cardio, orderIndex: 0 }] : [], estimatedMinutes: day.estimatedMinutes ?? 30, countsTowardGoal: false, targetExerciseCount: null });
      return;
    }
    update({ sessionType, muscles: day.muscles.filter((muscle) => muscle.id !== 'cardio'), estimatedMinutes: day.estimatedMinutes ?? 60, targetExerciseCount: null });
  };
  const toggleMuscle = (muscle: MuscleGroup) => {
    const selected = day.muscles.some((item) => item.id === muscle.id);
    const muscles = (selected ? day.muscles.filter((item) => item.id !== muscle.id) : [...day.muscles, { ...muscle, orderIndex: day.muscles.length }])
      .map((item, orderIndex) => ({ ...item, orderIndex }));
    update({ muscles, targetExerciseCount: null });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}><View><Text style={styles.day}>{metadata.dayName}</Text><Text style={styles.name}>{day.displayName || 'Configura músculos'}</Text></View>{day.countsTowardGoal ? <View style={styles.goalBadge}><Text style={styles.goalBadgeText}>OBJETIVO</Text></View> : null}</View>
      <View style={styles.section}><SectionTitle>Tipo de día</SectionTitle><View style={styles.chips}>{sessionTypes.map((type) => <Chip key={type.value} label={type.label} selected={day.sessionType === type.value} onPress={() => changeType(type.value)} />)}</View></View>
      {day.sessionType !== 'rest' ? <>
        <View style={styles.section}><SectionTitle>Músculos</SectionTitle><View style={styles.chips}>{(day.sessionType === 'cardio' ? muscleGroups.filter((muscle) => muscle.id === 'cardio') : muscleGroups).map((muscle) => <Chip key={muscle.id} label={muscle.name} selected={day.muscles.some((item) => item.id === muscle.id)} onPress={() => { if (day.sessionType === 'strength') toggleMuscle(muscle); }} />)}</View></View>
        <View style={styles.section}><SectionTitle>Duración</SectionTitle><View style={styles.chips}>{durations.map((duration) => <Chip key={duration} label={`${duration} min`} selected={day.estimatedMinutes === duration} onPress={() => update({ estimatedMinutes: duration })} />)}</View></View>
        <ToggleRow label="Sesión opcional" selected={day.isOptional} onPress={() => update({ isOptional: !day.isOptional })} />
        <ToggleRow label="Cuenta para objetivo semanal" selected={day.countsTowardGoal} onPress={() => update({ countsTowardGoal: !day.countsTowardGoal })} />
      </> : <Text style={styles.restHint}>Sin músculos ni duración. Este día no cuenta para tu objetivo.</Text>}
    </Card>
  );
}

function ToggleRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}><Text style={styles.toggleLabel}>{label}</Text><View style={[styles.toggle, selected && styles.toggleSelected]}>{selected ? <Ionicons color={colors.background} name="checkmark" size={16} /> : null}</View></Pressable>;
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg }, header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }, day: { ...typography.heading, color: colors.text }, name: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, maxWidth: 250 }, goalBadge: { borderRadius: radii.pill, backgroundColor: colors.primarySoft, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }, goalBadgeText: { ...typography.label, color: colors.primary, fontSize: 10 }, section: { gap: spacing.sm }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, toggleRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.md }, toggleLabel: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 }, toggle: { width: 32, height: 32, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, toggleSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, restHint: { ...typography.caption, color: colors.textMuted }, pressed: { opacity: 0.65 },
});
