import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { AuthShell } from '@/features/auth/AuthShell';

type IconName = ComponentProps<typeof Ionicons>['name'];

const benefits: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'calendar-outline',
    title: 'PLANIFICA',
    description: 'Crea un plan semanal personalizado para tus días de entrenamiento.',
  },
  {
    icon: 'barbell-outline',
    title: 'ENTRENA',
    description: 'Registra series, pesos y repeticiones durante cada sesión.',
  },
  {
    icon: 'options-outline',
    title: 'COACH',
    description: 'Genera rutinas locales por músculos y equipo disponible.',
  },
  {
    icon: 'swap-horizontal-outline',
    title: 'ADAPTA',
    description: 'Cambia ejercicios individualmente sin rehacer toda tu rutina.',
  },
  {
    icon: 'timer-outline',
    title: 'CARDIO',
    description: 'Configura su duración y usa un temporizador que conserva tu avance.',
  },
  {
    icon: 'stats-chart-outline',
    title: 'PROGRESA',
    description: 'Consulta tu historial y el cumplimiento de tu semana.',
  },
];

function BenefitRow({ icon, title, description, last }: (typeof benefits)[number] & { last: boolean }) {
  return (
    <View accessibilityLabel={`${title}. ${description}`} accessible style={[styles.benefitRow, last && styles.lastBenefitRow]}>
      <View style={styles.benefitIcon}>
        <Ionicons accessibilityElementsHidden color={colors.primary} importantForAccessibility="no" name={icon} size={20} />
      </View>
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

export function WelcomeScreen() {
  return (
    <AuthShell
      title="Tu entrenamiento. Tu progreso."
      subtitle="Planifica tu semana, registra cada serie y sigue tu evolución desde un solo lugar."
    >
      <Card style={styles.benefitsCard}>
        {benefits.map((benefit, index) => (
          <BenefitRow {...benefit} key={benefit.title} last={index === benefits.length - 1} />
        ))}
      </Card>

      <View style={styles.highlights}>
      <Card style={styles.highlightCard}>
        <View style={styles.highlightIcon}>
          <Ionicons accessibilityElementsHidden color={colors.primary} importantForAccessibility="no" name="business-outline" size={22} />
        </View>
        <View style={styles.highlightCopy}>
          <Text style={styles.highlightTitle}>Tu gimnasio, tus ejercicios</Text>
          <Text style={styles.highlightText}>GymTrack adapta las rutinas al equipo disponible en tu ubicación activa.</Text>
        </View>
      </Card>
      <Card style={styles.highlightCard}>
        <View style={styles.highlightIcon}>
          <Ionicons accessibilityElementsHidden color={colors.primary} importantForAccessibility="no" name="qr-code-outline" size={22} />
        </View>
        <View style={styles.highlightCopy}>
          <Text style={styles.highlightTitle}>Comparte rutinas por QR</Text>
          <Text style={styles.highlightText}>Comparte e importa ejercicios y la duración configurada de Cardio.</Text>
        </View>
      </Card>
      </View>

      <View accessibilityLabel="Coach inteligente. Próximamente." accessible style={styles.futureCoach}>
        <Ionicons accessibilityElementsHidden color={colors.primary} importantForAccessibility="no" name="sparkles-outline" size={20} />
        <View style={styles.futureCoachCopy}>
          <Text style={styles.futureCoachTitle}>Coach inteligente · Próximamente</Text>
          <Text style={styles.futureCoachText}>
            Recibe recomendaciones según tu objetivo, nivel, tiempo disponible y limitaciones en futuras versiones.
          </Text>
        </View>
      </View>

      <View accessibilityLabel="Privacidad de la cuenta" accessible style={styles.privacyRow}>
        <Ionicons accessibilityElementsHidden color={colors.textSubtle} importantForAccessibility="no" name="shield-checkmark-outline" size={18} />
        <Text style={styles.privacyText}>
          Tu cuenta mantiene tus entrenamientos y preferencias separados de otros usuarios del dispositivo.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton icon="person-add-outline" title="Crear cuenta" onPress={() => router.push('/register')} />
        <SecondaryButton icon="log-in-outline" title="Iniciar sesión" onPress={() => router.push('/login')} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  benefitsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastBenefitRow: {
    borderBottomWidth: 0,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  benefitCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  benefitTitle: {
    ...typography.label,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  benefitDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  highlights: {
    gap: spacing.sm,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderColor: `${colors.primary}55`,
  },
  highlightIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  highlightCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  highlightTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  highlightText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  futureCoach: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  futureCoachCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  futureCoachTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  futureCoachText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  privacyText: {
    ...typography.caption,
    flex: 1,
    color: colors.textSubtle,
  },
  actions: {
    gap: spacing.md,
  },
});
