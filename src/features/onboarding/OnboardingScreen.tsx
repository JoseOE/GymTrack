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
  const { completeLocalOnboarding, prepareCustomOnboarding, resetWeeklyPlan } = useGymTrack();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>('Ganar músculo');
  const [level, setLevel] = useState<ExperienceLevel>('Principiante');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState(60);
  const [planChoice, setPlanChoice] = useState<PlanChoice>('default');
  const [working, setWorking] = useState(false);

  const next = () => {
    if (step === 3) {
      const parsedHeight = Number(height.replace(',', '.'));
      const parsedWeight = Number(weight.replace(',', '.'));
      if (!height.trim() || !weight.trim() || !Number.isFinite(parsedHeight) || parsedHeight < 100 || parsedHeight > 250 || !Number.isFinite(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
        showToast({ type: 'warning', title: 'Revisa estatura y peso', message: 'Estatura: 100–250 cm. Peso: 30–300 kg.' });
        return;
      }
    }
    setStep((current) => Math.min(5, current + 1));
  };
  const complete = async () => {
    const displayName = accountProfile?.displayName.trim() || 'Atleta';
    const heightCm = Number(height.replace(',', '.'));
    const weightKg = Number(weight.replace(',', '.'));
    if (!height.trim() || !weight.trim() || !Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250 || !Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
      showToast({ type: 'warning', title: 'Revisa estatura y peso', message: 'Estatura: 100–250 cm. Peso: 30–300 kg.' });
      return;
    }
    const input = { displayName, heightCm, weightKg, goal, experienceLevel: level, defaultWorkoutMinutes: duration };
    setWorking(true);
    try {
      if (planChoice === 'custom') {
        prepareCustomOnboarding(input);
        router.push('/onboarding-weekly-plan');
        return;
      }
      await resetWeeklyPlan();
      await completeLocalOnboarding(input);
      await completeOnboarding(displayName);
      showToast({ type: 'success', title: 'Perfil preparado', message: 'Tus preferencias quedaron guardadas en este dispositivo.' });
      router.replace('/');
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo completar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally { setWorking(false); }
  };

  return <Screen><ScreenHeader title="Configura GymTrack" subtitle={`Paso ${step} de 5`} /><View style={styles.progress}>{[1, 2, 3, 4, 5].map((item) => <View key={item} style={[styles.progressItem, item <= step && styles.progressActive]} />)}</View>{step === 1 ? <ChoiceStep title="¿Cuál es tu objetivo principal?" options={goals} value={goal} onChange={(value) => setGoal(value as Goal)} /> : null}{step === 2 ? <ChoiceStep title="¿Cuál es tu nivel actual?" options={levels} value={level} onChange={(value) => setLevel(value as ExperienceLevel)} /> : null}{step === 3 ? <Card style={styles.card}><SectionTitle>Datos personales</SectionTitle><Text style={styles.hint}>Confirma tus valores para personalizar tu perfil local.</Text><View style={styles.row}><View style={styles.field}><Text style={styles.label}>Estatura (cm)</Text><TextInput keyboardType="decimal-pad" onChangeText={setHeight} placeholder="100–250" placeholderTextColor={colors.textSubtle} style={styles.input} value={height} /></View><View style={styles.field}><Text style={styles.label}>Peso (kg)</Text><TextInput keyboardType="decimal-pad" onChangeText={setWeight} placeholder="30–300" placeholderTextColor={colors.textSubtle} style={styles.input} value={weight} /></View></View></Card> : null}{step === 4 ? <ChoiceStep title="Duración habitual" options={durations.map((item) => `${item} min`)} value={`${duration} min`} onChange={(value) => setDuration(Number(value.replace(' min', '')))} /> : null}{step === 5 ? <Card style={styles.card}><SectionTitle>Plan semanal</SectionTitle><PlanOption description="Carga la distribución inicial de cinco días, cardio opcional y descanso." label="Usar plan inicial de GymTrack" selected={planChoice === 'default'} onPress={() => setPlanChoice('default')} /><PlanOption description="Abre el editor y completa el onboarding únicamente después de guardar." label="Personalizar mi plan" selected={planChoice === 'custom'} onPress={() => setPlanChoice('custom')} /><Text style={styles.future}>La generación con IA se incorporará en una fase futura.</Text></Card> : null}<View style={styles.actions}>{step < 5 ? <PrimaryButton icon="arrow-forward" title="Continuar" onPress={next} /> : <PrimaryButton icon="checkmark-circle-outline" loading={working} title={planChoice === 'custom' ? 'Personalizar plan' : 'Completar configuración'} onPress={() => void complete()} />}{step > 1 ? <SecondaryButton icon="arrow-back" title="Atrás" onPress={() => setStep((current) => current - 1)} /> : null}</View></Screen>;
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
