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
    description: 'Organiza tus días de entrenamiento y adapta tu distribución semanal.',
  },
  {
    icon: 'barbell-outline',
    title: 'REGISTRA',
    description: 'Guarda ejercicios, series, peso y repeticiones durante cada sesión.',
  },
  {
    icon: 'stats-chart-outline',
    title: 'PROGRESA',
    description: 'Consulta tu historial y sigue el cumplimiento de tus entrenamientos.',
  },
  {
    icon: 'options-outline',
    title: 'COACH',
    description: 'Prepara rutinas según tus músculos, tiempo disponible y objetivo.',
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

      <Card style={styles.personalizationCard}>
        <View style={styles.highlightIcon}>
          <Ionicons accessibilityElementsHidden color={colors.primary} importantForAccessibility="no" name="fitness-outline" size={22} />
        </View>
        <View style={styles.highlightCopy}>
          <Text style={styles.highlightTitle}>Entrena a tu manera</Text>
          <Text style={styles.highlightText}>
            Personaliza tu plan semanal, duración habitual y preferencias para adaptar GymTrack a tu rutina.
          </Text>
        </View>
      </Card>

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
  personalizationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
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
    ...typography.heading,
    color: colors.text,
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
