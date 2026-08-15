import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { MuscleExerciseTarget, RoutinePreview, RoutineRequest, WeeklyPlanMuscle } from '@/domain/models';
import { RoutineShareModal } from '@/features/routines/RoutineShareModal';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { encodeSharedRoutine } from '@/services/sharedRoutineService';
import { getPlanForDate } from '@/services/weeklyPlanService';
import {
  describeDurationDifference, formatDuration, MAX_ROUTINE_DURATION_MINUTES, MIN_ROUTINE_DURATION_MINUTES,
  ROUTINE_DURATION_STEP_MINUTES,
} from '@/utils/duration';
import {
  CARDIO_DURATION_STEP_MINUTES, DEFAULT_CARDIO_DURATION_MINUTES, MAX_CARDIO_DURATION_MINUTES,
  MIN_CARDIO_DURATION_MINUTES,
} from '@/utils/cardioTimer';

const objectives = ['Ganar músculo', 'Ganar fuerza', 'Perder grasa'];
const durationPresets = [30, 45, 60, 75, 90, 120, 150];
const limitations = ['Ninguna', 'Hombro', 'Rodilla', 'Espalda'];

export function CoachScreen() {
  const { initializing, refreshing, weeklyPlan } = useGymTrack();
  if (!weeklyPlan) return <Screen><ScreenHeader title="Coach" subtitle={initializing || refreshing ? 'Cargando tu plan semanal…' : 'Plan semanal no disponible'} /></Screen>;
  const defaultMuscles = getPlanForDate(weeklyPlan, new Date()).muscles;
  return <CoachForm defaultMuscles={defaultMuscles} key={weeklyPlan.updatedAt} />;
}

function CoachForm({ defaultMuscles }: { defaultMuscles: WeeklyPlanMuscle[] }) {
  const { acceptRoutine, activeTrainingLocation, muscleGroups, previewRoutine, replacePreviewExercise } = useGymTrack();
  const { showToast } = useFeedback();
  const [level, setLevel] = useState('Intermedio');
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<string[]>(defaultMuscles.map((muscle) => muscle.id));
  const [exerciseCounts, setExerciseCounts] = useState<Record<string, number>>(() => Object.fromEntries(defaultMuscles.map((muscle) => [muscle.id, 2])));
  const [cardioDurationMinutes, setCardioDurationMinutes] = useState(DEFAULT_CARDIO_DURATION_MINUTES);
  const [objective, setObjective] = useState('Ganar músculo');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(60);
  const [customDuration, setCustomDuration] = useState(false);
  const [limitation, setLimitation] = useState('Ninguna');
  const [preview, setPreview] = useState<RoutinePreview | null>(null);
  const [previewRequest, setPreviewRequest] = useState<RoutineRequest | null>(null);
  const [sharePayload, setSharePayload] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const replacementHistory = useRef<Record<number, string[]>>({});

  const toggleMuscle = (muscleId: string) => {
    setSelectedMuscleIds((current) => current.includes(muscleId)
      ? current.filter((id) => id !== muscleId)
      : [...current, muscleId]);
    setExerciseCounts((current) => current[muscleId] ? current : { ...current, [muscleId]: 2 });
  };
  const changeExerciseCount = (muscleId: string, delta: number) => {
    setExerciseCounts((current) => ({ ...current, [muscleId]: Math.min(6, Math.max(1, (current[muscleId] ?? 2) + delta)) }));
  };
  const cardioSelected = selectedMuscleIds.includes('cardio');
  const muscleTargets: MuscleExerciseTarget[] = selectedMuscleIds.filter((muscleId) => muscleId !== 'cardio').flatMap((muscleId) => {
    const muscle = muscleGroups.find((item) => item.id === muscleId);
    return muscle ? [{ muscleId, muscleName: muscle.name, exerciseCount: exerciseCounts[muscleId] ?? 2 }] : [];
  });
  const requestedStrengthCount = muscleTargets.reduce((total, target) => total + target.exerciseCount, 0);
  const requestedExerciseCount = requestedStrengthCount + (cardioSelected ? 1 : 0);
  const buildRequest = (): RoutineRequest => ({
    muscleTargets,
    cardioTarget: cardioSelected ? { durationMinutes: cardioDurationMinutes } : undefined,
    targetDurationMinutes,
  });

  const generate = async (request: RoutineRequest) => {
    if (request.muscleTargets.length === 0 && !request.cardioTarget) {
      showToast({ type: 'warning', title: 'Selecciona músculos', message: 'Elige al menos un grupo muscular.' });
      return;
    }
    setWorking(true);
    try {
      const nextPreview = await previewRoutine(request);
      setPreview(nextPreview);
      setPreviewRequest(request);
      replacementHistory.current = {};
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo generar', message: reason instanceof Error ? reason.message : 'Prueba otra selección.' });
    } finally {
      setWorking(false);
    }
  };
  const replaceExercise = async (exerciseIndex: number) => {
    if (!preview) return;
    const previousExerciseId = preview.exercises[exerciseIndex]?.exerciseId;
    setReplacingIndex(exerciseIndex);
    try {
      const nextPreview = await replacePreviewExercise(preview, exerciseIndex, replacementHistory.current[exerciseIndex]);
      if (previousExerciseId) {
        replacementHistory.current[exerciseIndex] = [...(replacementHistory.current[exerciseIndex] ?? []), previousExerciseId];
      }
      setPreview(nextPreview);
    } catch (reason) {
      showToast({ type: 'warning', title: 'Sin alternativa', message: reason instanceof Error ? reason.message : 'No pudimos cambiar este ejercicio.' });
    } finally {
      setReplacingIndex(null);
    }
  };
  const accept = async () => {
    if (!preview) return;
    setWorking(true);
    try {
      await acceptRoutine(preview);
      setPreview(null);
      showToast({ type: 'success', title: 'Rutina guardada', message: 'Será la rutina usada al iniciar tu próxima sesión.' });
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo guardar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
    } finally {
      setWorking(false);
    }
  };
  const sharePreview = () => {
    if (!preview) return;
    try {
      setSharePayload(encodeSharedRoutine({ name: preview.name, exercises: preview.exercises }));
    } catch (reason) {
      showToast({ type: 'warning', title: 'No se pudo compartir', message: reason instanceof Error ? reason.message : 'Esta rutina no se puede convertir en QR.' });
    }
  };

  return <Screen>
    <ScreenHeader title="Coach" subtitle={`Generador local · ${activeTrainingLocation?.name ?? 'sin ubicación activa'}`} />
    <Card style={styles.intro}><Text style={styles.introTitle}>Tu rutina, a tu medida</Text><Text style={styles.introText}>Elige cuántos ejercicios quieres para cada músculo. La duración es un objetivo y nunca elimina tu selección.</Text></Card>
    <SecondaryButton icon="qr-code-outline" title="Importar rutina" onPress={() => router.push('/routine-import')} />
    <ChoiceField title="Nivel" options={['Principiante', 'Intermedio', 'Avanzado']} value={level} onChange={setLevel} />
    <ChoiceField title="Objetivo" options={objectives} value={objective} onChange={setObjective} />
    <View style={styles.section}>
      <SectionTitle>Duración objetivo</SectionTitle>
      <View style={styles.chips}>{durationPresets.map((duration) => <Chip key={duration} label={formatDuration(duration)} selected={!customDuration && targetDurationMinutes === duration} onPress={() => { setTargetDurationMinutes(duration); setCustomDuration(false); }} />)}<Chip label="Personalizado" selected={customDuration} onPress={() => setCustomDuration(true)} /></View>
      {customDuration ? <Stepper label="Duración objetivo" value={formatDuration(targetDurationMinutes)} decrementDisabled={targetDurationMinutes <= MIN_ROUTINE_DURATION_MINUTES} incrementDisabled={targetDurationMinutes >= MAX_ROUTINE_DURATION_MINUTES} onDecrement={() => setTargetDurationMinutes((current) => Math.max(MIN_ROUTINE_DURATION_MINUTES, current - ROUTINE_DURATION_STEP_MINUTES))} onIncrement={() => setTargetDurationMinutes((current) => Math.min(MAX_ROUTINE_DURATION_MINUTES, current + ROUTINE_DURATION_STEP_MINUTES))} /> : null}
    </View>
    <View style={styles.section}>
      <SectionTitle>Músculos a entrenar</SectionTitle>
      <View style={styles.chips}>{muscleGroups.map((muscle) => <Chip key={muscle.id} label={muscle.name} selected={selectedMuscleIds.includes(muscle.id)} onPress={() => toggleMuscle(muscle.id)} />)}</View>
      <View style={styles.targetList}>{muscleTargets.map((target) => <Stepper key={target.muscleId} label={target.muscleName} value={String(target.exerciseCount)} decrementDisabled={target.exerciseCount <= 1} incrementDisabled={target.exerciseCount >= 6} onDecrement={() => changeExerciseCount(target.muscleId, -1)} onIncrement={() => changeExerciseCount(target.muscleId, 1)} />)}{cardioSelected ? <Stepper label="Cardio · Duración" value={formatDuration(cardioDurationMinutes)} decrementDisabled={cardioDurationMinutes <= MIN_CARDIO_DURATION_MINUTES} incrementDisabled={cardioDurationMinutes >= MAX_CARDIO_DURATION_MINUTES} onDecrement={() => setCardioDurationMinutes((current) => Math.max(MIN_CARDIO_DURATION_MINUTES, current - CARDIO_DURATION_STEP_MINUTES))} onIncrement={() => setCardioDurationMinutes((current) => Math.min(MAX_CARDIO_DURATION_MINUTES, current + CARDIO_DURATION_STEP_MINUTES))} /> : null}</View>
    </View>
    <Card style={styles.summary}><Text style={styles.summaryValue}>{requestedExerciseCount} ejercicios solicitados</Text>{cardioSelected ? <Text style={styles.summaryLabel}>{requestedStrengthCount} de fuerza · Cardio {formatDuration(cardioDurationMinutes)}</Text> : null}<Text style={styles.summaryLabel}>Objetivo total · {formatDuration(targetDurationMinutes)}</Text></Card>
    <ChoiceField title="Lesiones o limitaciones" options={limitations} value={limitation} onChange={setLimitation} />
    {limitation !== 'Ninguna' ? <Text style={styles.warning}>La limitación queda seleccionada localmente, pero esta versión provisional todavía no evalúa seguridad clínica.</Text> : null}
    {preview ? <Card style={styles.preview}>
      <View><Text style={styles.previewTitle}>{preview.name}</Text><Text style={styles.previewMeta}>{preview.exercises.length} ejercicios · {preview.locationName}</Text><Text style={styles.previewDetail}>Objetivo · {formatDuration(preview.targetDurationMinutes)}</Text><Text style={styles.previewDetail}>Estimación · ≈ {formatDuration(preview.estimatedDurationMinutes)}</Text><Text style={styles.durationMessage}>{describeDurationDifference(preview.targetDurationMinutes, preview.estimatedDurationMinutes)}</Text>{preview.availabilityMessages.map((message) => <Text key={message} style={styles.warning}>{message}</Text>)}</View>
      {preview.exercises.map((exercise, index) => <View key={`${index}-${exercise.exerciseId}`} style={styles.previewRow}><Text style={styles.previewNumber}>{index + 1}</Text><View style={styles.previewCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMuscle}>{exercise.targetMuscleName}{exercise.mode === 'cardio' ? ` · ${formatDuration(exercise.targetDurationMinutes ?? exercise.estimatedMinutes)}` : ''}</Text></View><Pressable accessibilityLabel={`Cambiar ${exercise.name}`} accessibilityRole="button" disabled={replacingIndex !== null || working} onPress={() => void replaceExercise(index)} style={({ pressed }) => [styles.changeButton, pressed && styles.pressed, (replacingIndex !== null || working) && styles.disabled]}>{replacingIndex === index ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons color={colors.primary} name="refresh" size={18} />}<Text style={styles.changeText}>Cambiar</Text></Pressable></View>)}
      <View style={styles.actions}><View style={styles.flex}><SecondaryButton disabled={replacingIndex !== null} title="Cancelar" onPress={() => setPreview(null)} /></View><View style={styles.flex}><SecondaryButton disabled={replacingIndex !== null} icon="refresh" title="Regenerar toda" loading={working} onPress={() => void generate(previewRequest ?? buildRequest())} /></View></View>
      <SecondaryButton disabled={replacingIndex !== null || working} icon="qr-code-outline" title="Compartir QR" onPress={sharePreview} />
      <PrimaryButton disabled={replacingIndex !== null} icon="save-outline" loading={working} title="Aceptar y guardar" onPress={() => void accept()} />
    </Card> : <PrimaryButton icon="sparkles-outline" loading={working} title="Generar rutina" onPress={() => void generate(buildRequest())} />}
    <Text style={styles.disclaimer}>Sin OpenAI · sin IA · selección local desde el catálogo y tu equipo disponible</Text>
    <RoutineShareModal exerciseCount={preview?.exercises.length ?? 0} onClose={() => setSharePayload(null)} payload={sharePayload ?? ''} routineName={preview?.name ?? 'Rutina GymTrack'} visible={sharePayload !== null} />
  </Screen>;
}

function Stepper({ label, value, decrementDisabled, incrementDisabled, onDecrement, onIncrement }: { label: string; value: string; decrementDisabled: boolean; incrementDisabled: boolean; onDecrement: () => void; onIncrement: () => void }) {
  return <View style={styles.stepper}><Text style={styles.stepperLabel}>{label}</Text><View style={styles.stepperControls}><Pressable accessibilityLabel={`Reducir ${label}`} accessibilityRole="button" disabled={decrementDisabled} onPress={onDecrement} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed, decrementDisabled && styles.disabled]}><Ionicons color={colors.text} name="remove" size={20} /></Pressable><Text style={styles.stepperValue}>{value}</Text><Pressable accessibilityLabel={`Aumentar ${label}`} accessibilityRole="button" disabled={incrementDisabled} onPress={onIncrement} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed, incrementDisabled && styles.disabled]}><Ionicons color={colors.text} name="add" size={20} /></Pressable></View></View>;
}

function ChoiceField({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.section}><SectionTitle>{title}</SectionTitle><View style={styles.chips}>{options.map((option) => <Chip key={option} label={option} selected={value === option} onPress={() => onChange(option)} />)}</View></View>;
}

const styles = StyleSheet.create({
  intro: { backgroundColor: colors.primarySoft, borderColor: '#415827' },
  introTitle: { ...typography.heading, color: colors.primary },
  introText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  section: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  targetList: { gap: spacing.sm },
  stepper: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  stepperLabel: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 },
  stepperValue: { ...typography.heading, color: colors.primary, minWidth: 64, textAlign: 'center' },
  summary: { gap: spacing.xs },
  summaryValue: { ...typography.heading, color: colors.text },
  summaryLabel: { ...typography.body, color: colors.primary },
  preview: { gap: spacing.lg },
  previewTitle: { ...typography.title, color: colors.text },
  previewMeta: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  previewDetail: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  durationMessage: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  previewNumber: { ...typography.label, color: colors.primary, width: 20 },
  previewCopy: { flex: 1 },
  exerciseName: { ...typography.body, color: colors.text, fontWeight: '700' },
  exerciseMuscle: { ...typography.caption, color: colors.textMuted },
  changeButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated },
  changeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  warning: { ...typography.caption, color: colors.warning },
  disclaimer: { ...typography.caption, color: colors.textSubtle, textAlign: 'center', marginTop: -spacing.md },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
});
