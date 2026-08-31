import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { WarmUpPlan } from '@/domain/models';
import { formatDuration } from '@/utils/duration';

export function WarmUpCard({ plan }: { plan: WarmUpPlan }) {
  return <Card style={styles.card}>
    <View style={styles.header}>
      <View style={styles.icon}><Ionicons color={colors.primary} name="flame-outline" size={20} /></View>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>CALENTAMIENTO</Text>
        <Text style={styles.estimate}>≈ {formatDuration(plan.estimatedMinutes)} adicionales</Text>
      </View>
    </View>
    {plan.steps.map((step, index) => <View key={step.title} style={styles.step}>
      <Text style={styles.number}>{index + 1}</Text>
      <View style={styles.copy}>
        <View style={styles.stepTitleRow}><Text style={styles.title}>{step.title}</Text><Text style={styles.duration}>{step.durationLabel}</Text></View>
        <Text style={styles.description}>{step.description}</Text>
      </View>
    </View>)}
    <Text style={styles.note}>Guía previa: no cuenta como ejercicio, serie ni volumen del entrenamiento.</Text>
  </Card>;
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, borderColor: `${colors.primary}55`, backgroundColor: colors.primarySoft },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  headerCopy: { flex: 1 },
  eyebrow: { ...typography.label, color: colors.primary, letterSpacing: 0.8 },
  estimate: { ...typography.caption, color: colors.textMuted },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  number: { ...typography.label, color: colors.primary, width: 20, paddingTop: 3 },
  copy: { flex: 1, gap: spacing.xs },
  stepTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  duration: { ...typography.caption, color: colors.primary },
  description: { ...typography.caption, color: colors.textMuted },
  note: { ...typography.caption, color: colors.textSubtle },
});
