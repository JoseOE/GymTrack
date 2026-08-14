import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, PrimaryButton, Screen, ScreenHeader, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import type { MuscleGroup, OnboardingProfileInput, WeeklyPlan, WeeklyPlanDayDraft, WeeklyPlanDraft } from '@/domain/models';
import { WeeklyPlanDayEditor } from '@/features/weeklyPlan/WeeklyPlanDayEditor';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { getWeeklyTarget, toWeeklyPlanDraft, validateWeeklyPlan } from '@/services/weeklyPlanService';

type WeeklyPlanEditorProps = {
  plan: WeeklyPlan;
  muscleGroups: MuscleGroup[];
  updateWeeklyPlan: (draft: WeeklyPlanDraft) => Promise<void>;
  resetWeeklyPlan: () => Promise<void>;
  onboarding: boolean;
  pendingProfile: OnboardingProfileInput | null;
  completeLocalOnboarding: (input: OnboardingProfileInput) => Promise<void>;
  completeOnboarding: (displayName: string) => Promise<void>;
  clearCustomOnboarding: () => void;
};

export function WeeklyPlanScreen({ onboarding = false }: { onboarding?: boolean }) {
  const { completeOnboarding } = useAuth();
  const { clearCustomOnboarding, completeLocalOnboarding, initializing, muscleGroups, pendingOnboardingProfile, refreshing, resetWeeklyPlan, updateWeeklyPlan, weeklyPlan } = useGymTrack();
  if (!weeklyPlan) return <Screen><ScreenHeader title="Plan semanal" subtitle={initializing || refreshing ? 'Cargando configuración local…' : 'No se encontró un plan activo'} /></Screen>;
  if (onboarding && !pendingOnboardingProfile) return <Redirect href="/onboarding" />;
  return <WeeklyPlanEditor clearCustomOnboarding={clearCustomOnboarding} completeLocalOnboarding={completeLocalOnboarding} completeOnboarding={completeOnboarding} key={onboarding ? 'onboarding-plan' : weeklyPlan.updatedAt} muscleGroups={muscleGroups} onboarding={onboarding} pendingProfile={pendingOnboardingProfile} plan={weeklyPlan} resetWeeklyPlan={resetWeeklyPlan} updateWeeklyPlan={updateWeeklyPlan} />;
}

function WeeklyPlanEditor({ plan, muscleGroups, updateWeeklyPlan, resetWeeklyPlan, onboarding, pendingProfile, completeLocalOnboarding, completeOnboarding, clearCustomOnboarding }: WeeklyPlanEditorProps) {
  const { confirm, showToast } = useFeedback();
  const [draft, setDraft] = useState(() => toWeeklyPlanDraft(plan));
  const [saving, setSaving] = useState(false);
  const target = getWeeklyTarget(draft);
  const updateDay = (nextDay: WeeklyPlanDayDraft) => setDraft((current) => ({ ...current, source: 'manual', days: current.days.map((day) => day.dayIndex === nextDay.dayIndex ? nextDay : day) }));
  const save = async () => {
    try {
      validateWeeklyPlan(draft);
      setSaving(true);
      await updateWeeklyPlan({ ...draft, source: 'manual' });
      if (onboarding) {
        if (!pendingProfile) throw new Error('Las preferencias del onboarding ya no están disponibles.');
        await completeLocalOnboarding(pendingProfile);
        await completeOnboarding(pendingProfile.displayName);
        clearCustomOnboarding();
        showToast({ type: 'success', title: 'Perfil preparado', message: 'Tu plan personalizado quedó guardado.' });
        router.replace('/');
      } else {
        showToast({ type: 'success', title: 'Plan actualizado', message: 'Tu calendario semanal ya utiliza la nueva distribución.' });
      }
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo guardar', message: reason instanceof Error ? reason.message : 'Revisa la configuración.' });
    } finally {
      setSaving(false);
    }
  };
  const requestReset = () => confirm({
    title: '¿Restaurar plan predeterminado?',
    message: 'Tu distribución semanal personalizada será reemplazada.',
    confirmLabel: 'Restaurar',
    cancelLabel: 'Cancelar',
    tone: 'warning',
    icon: 'refresh-circle-outline',
    onConfirm: async () => { await resetWeeklyPlan(); showToast({ type: 'success', title: 'Plan restaurado', message: 'Volviste a la distribución predeterminada de GymTrack.' }); },
  });
  const close = () => {
    if (onboarding) {
      clearCustomOnboarding();
      router.replace('/onboarding');
    } else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <ScreenHeader title={onboarding ? 'Personaliza tu plan' : 'Plan semanal'} subtitle={`${target} ${target === 1 ? 'día cuenta' : 'días cuentan'} para tu objetivo`} action={<IconButton icon="close" label="Cerrar editor" onPress={close} />} />
      <Card style={styles.intro}><Text style={styles.introTitle}>Tu distribución, tus reglas</Text><Text style={styles.introText}>Los cambios se aplican a sesiones futuras. Una sesión que ya está activa conserva su configuración original.</Text></Card>
      {target >= 7 ? <Text style={styles.warning}>Configuraste 7 días para el objetivo. Es una distribución exigente; ajústala según tus necesidades personales.</Text> : null}
      <View style={styles.days}>{draft.days.slice().sort((left, right) => (left.dayIndex || 7) - (right.dayIndex || 7)).map((day) => <WeeklyPlanDayEditor day={day} key={day.dayIndex} muscleGroups={muscleGroups} onChange={updateDay} />)}</View>
      <PrimaryButton icon="save-outline" loading={saving} title={onboarding ? 'Guardar y completar onboarding' : 'Guardar plan'} onPress={() => void save()} />
      <SecondaryButton icon="refresh" title="Restaurar plan predeterminado" onPress={requestReset} />
      <Text style={styles.future}>El mismo formato podrá recibir planes manuales o propuestas de IA en una fase futura. Esta versión no realiza solicitudes externas.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { backgroundColor: colors.primarySoft, gap: spacing.sm }, introTitle: { ...typography.heading, color: colors.primary }, introText: { ...typography.body, color: colors.textMuted }, warning: { ...typography.caption, color: colors.warning }, days: { gap: spacing.lg }, future: { ...typography.caption, color: colors.textSubtle, textAlign: 'center' } });
