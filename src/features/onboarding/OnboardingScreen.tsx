import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Chip, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { ExperienceLevel, Goal } from '@/domain/models';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

const goals: Goal[] = ['Ganar músculo', 'Ganar fuerza', 'Perder grasa', 'Mejorar condición física', 'Salud general'];
const levels: ExperienceLevel[] = ['Principiante', 'Intermedio', 'Avanzado'];
const durations = [30, 45, 60, 75, 90];
type PlanChoice = 'default' | 'custom';

export function OnboardingScreen() {
  const { accountProfile, completeOnboarding } = useAuth();
  const { showToast } = useFeedback();
  const { completeLocalOnboarding, profile } = useGymTrack();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'Ganar músculo');
  const [level, setLevel] = useState<ExperienceLevel>(profile?.experienceLevel ?? 'Principiante');
  const [height, setHeight] = useState(profile ? String(profile.heightCm) : '');
  const [weight, setWeight] = useState(profile ? String(profile.weightKg) : '');
  const [duration, setDuration] = useState(profile?.defaultWorkoutMinutes ?? 60);
  const [planChoice, setPlanChoice] = useState<PlanChoice>('default');
  const [working, setWorking] = useState(false);

  const next = () => {
    if (step === 3) {
      const parsedHeight = height.trim() ? Number(height.replace(',', '.')) : 170;
      const parsedWeight = weight.trim() ? Number(weight.replace(',', '.')) : 70;
      if (parsedHeight <= 0 || parsedWeight <= 0 || !Number.isFinite(parsedHeight) || !Number.isFinite(parsedWeight)) {
        showToast({ type: 'warning', title: 'Revisa estatura y peso', message: 'Déjalos vacíos o escribe valores positivos.' });
        return;
      }
    }
    setStep((current) => Math.min(5, current + 1));
  };
  const complete = async () => {
    const displayName = accountProfile?.displayName.trim() || 'Atleta';
    const heightCm = height.trim() ? Number(height.replace(',', '.')) : 170;
    const weightKg = weight.trim() ? Number(weight.replace(',', '.')) : 70;
    setWorking(true);
    try {
      await completeLocalOnboarding({ displayName, heightCm, weightKg, goal, experienceLevel: level, defaultWorkoutMinutes: duration });
      await completeOnboarding(displayName);
      showToast({ type: 'success', title: 'Perfil preparado', message: 'Tus preferencias quedaron guardadas en este dispositivo.' });
      router.replace(planChoice === 'custom' ? '/weekly-plan' : '/');
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo completar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally { setWorking(false); }
  };

  return <Screen><ScreenHeader title="Configura GymTrack" subtitle={`Paso ${step} de 5`} /><View style={styles.progress}>{[1, 2, 3, 4, 5].map((item) => <View key={item} style={[styles.progressItem, item <= step && styles.progressActive]} />)}</View>{step === 1 ? <ChoiceStep title="¿Cuál es tu objetivo principal?" options={goals} value={goal} onChange={(value) => setGoal(value as Goal)} /> : null}{step === 2 ? <ChoiceStep title="¿Cuál es tu nivel actual?" options={levels} value={level} onChange={(value) => setLevel(value as ExperienceLevel)} /> : null}{step === 3 ? <Card style={styles.card}><SectionTitle>Datos personales opcionales</SectionTitle><Text style={styles.hint}>Puedes dejarlos vacíos y actualizarlos después desde Perfil.</Text><View style={styles.row}><View style={styles.field}><Text style={styles.label}>Estatura (cm)</Text><TextInput keyboardType="decimal-pad" onChangeText={setHeight} placeholder="Opcional" placeholderTextColor={colors.textSubtle} style={styles.input} value={height} /></View><View style={styles.field}><Text style={styles.label}>Peso (kg)</Text><TextInput keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Opcional" placeholderTextColor={colors.textSubtle} style={styles.input} value={weight} /></View></View></Card> : null}{step === 4 ? <ChoiceStep title="Duración habitual" options={durations.map((item) => `${item} min`)} value={`${duration} min`} onChange={(value) => setDuration(Number(value.replace(' min', '')))} /> : null}{step === 5 ? <Card style={styles.card}><SectionTitle>Plan semanal</SectionTitle><PlanOption description="Carga la distribución inicial de cinco días, cardio opcional y descanso." label="Usar plan inicial de GymTrack" selected={planChoice === 'default'} onPress={() => setPlanChoice('default')} /><PlanOption description="Termina el onboarding y abre el editor local existente." label="Personalizar mi plan" selected={planChoice === 'custom'} onPress={() => setPlanChoice('custom')} /><Text style={styles.future}>La generación con IA se incorporará en una fase futura.</Text></Card> : null}<View style={styles.actions}>{step < 5 ? <PrimaryButton icon="arrow-forward" title="Continuar" onPress={next} /> : <PrimaryButton icon="checkmark-circle-outline" loading={working} title="Completar configuración" onPress={() => void complete()} />}{step > 1 ? <SecondaryButton icon="arrow-back" title="Atrás" onPress={() => setStep((current) => current - 1)} /> : null}</View></Screen>;
}

function ChoiceStep({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <Card style={styles.card}><SectionTitle>{title}</SectionTitle><View style={styles.chips}>{options.map((option) => <Chip key={option} label={option} selected={value === option} onPress={() => onChange(option)} />)}</View></Card>;
}

function PlanOption({ label, description, selected, onPress }: { label: string; description: string; selected: boolean; onPress: () => void }) {
  return <Card style={[styles.planOption, selected && styles.planSelected]}><Text style={[styles.planTitle, selected && styles.planTitleSelected]}>{label}</Text><Text style={styles.hint}>{description}</Text><SecondaryButton icon={selected ? 'checkmark-circle' : 'ellipse-outline'} title={selected ? 'Seleccionado' : 'Elegir'} onPress={onPress} /></Card>;
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.sm }, progressItem: { flex: 1, height: 5, borderRadius: radii.pill, backgroundColor: colors.surfaceElevated }, progressActive: { backgroundColor: colors.primary },
  card: { gap: spacing.lg }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, row: { flexDirection: 'row', gap: spacing.md }, field: { flex: 1, gap: spacing.sm }, label: { ...typography.label, color: colors.textMuted },
  input: { ...typography.body, minHeight: 52, borderRadius: radii.md, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md },
  hint: { ...typography.caption, color: colors.textMuted }, actions: { gap: spacing.md }, planOption: { gap: spacing.sm, backgroundColor: colors.surfaceElevated }, planSelected: { borderColor: colors.primary }, planTitle: { ...typography.heading, color: colors.text }, planTitleSelected: { color: colors.primary }, future: { ...typography.caption, color: colors.textSubtle, textAlign: 'center' },
});
