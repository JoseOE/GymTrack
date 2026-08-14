import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, Metric, PrimaryButton, ProgressBar, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { weeklyProgress } from '@/data/mockData';

export function HomeScreen() {
  return (
    <Screen>
      <ScreenHeader title="GymTrack" subtitle="Viernes, 14 de agosto" action={<IconButton icon="person-outline" label="Abrir perfil y configuración" onPress={() => Alert.alert('Perfil', 'La configuración estará disponible próximamente.')} />} />
      <Card style={styles.hero}>
        <View style={styles.eyebrow}><View style={styles.dot} /><Text style={styles.eyebrowText}>ENTRENAMIENTO DE HOY</Text></View>
        <Text style={styles.workout}>Pierna completa</Text>
        <Text style={styles.description}>Fuerza · Rutina intermedia</Text>
        <View style={styles.metrics}>
          <Metric icon="time-outline" label="Duración" value="75 min" />
          <View style={styles.divider} />
          <Metric icon="barbell-outline" label="Ejercicios" value="6" />
        </View>
        <PrimaryButton title="Iniciar entrenamiento" onPress={() => router.push('/workout')} />
      </Card>
      <View style={styles.section}>
        <SectionTitle detail={`${weeklyProgress.completed} de ${weeklyProgress.target} días`}>Progreso semanal</SectionTitle>
        <Card>
          <View style={styles.progressCopy}><Text style={styles.progressValue}>{Math.round((weeklyProgress.completed / weeklyProgress.target) * 100)}%</Text><Text style={styles.progressHint}>¡Buen ritmo! Sigue así.</Text></View>
          <ProgressBar value={(weeklyProgress.completed / weeklyProgress.target) * 100} />
          <View style={styles.days}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => { const completed = weeklyProgress.completedDays.includes(day); return <View key={day} style={styles.day}><View style={[styles.dayCircle, completed && styles.dayComplete]}>{completed ? <Ionicons color={colors.background} name="checkmark" size={15} /> : null}</View><Text style={styles.dayLabel}>{day}</Text></View>; })}</View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.lg },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.primary },
  eyebrowText: { ...typography.label, color: colors.primary, letterSpacing: 0.8 },
  workout: { ...typography.title, color: colors.text },
  description: { ...typography.body, color: colors.textMuted, marginTop: -spacing.sm },
  metrics: { flexDirection: 'row', marginVertical: spacing.sm },
  divider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl },
  section: { gap: spacing.md },
  progressCopy: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md, marginBottom: spacing.md },
  progressValue: { ...typography.title, color: colors.text },
  progressHint: { ...typography.caption, color: colors.textMuted },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  day: { alignItems: 'center', gap: spacing.sm },
  dayCircle: { width: 28, height: 28, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dayComplete: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayLabel: { ...typography.label, color: colors.textMuted },
});
