import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Chip, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionTitle } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { getScheduleForDate } from '@/constants/workoutSchedule';
import type { RoutinePreview } from '@/domain/models';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

const muscles = ['Pecho', 'Espalda', 'Hombro', 'Cuádriceps', 'Femoral', 'Glúteo', 'Pantorrilla', 'Bíceps', 'Tríceps', 'Antebrazo', 'Abdomen', 'Cardio', 'Aductores', 'Abductores', 'Lumbar', 'Trapecio', 'Core'];
const objectives = ['Ganar músculo', 'Ganar fuerza', 'Perder grasa'];
const durations = ['30', '45', '60', '75'];
const exerciseCounts = ['1', '2', '3', '4'];
const limitations = ['Ninguna', 'Hombro', 'Rodilla', 'Espalda'];

export function CoachScreen() {
  const { acceptRoutine, previewRoutine } = useGymTrack();
  const { showToast } = useFeedback();
  const [level, setLevel] = useState('Intermedio');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(() => [...getScheduleForDate(new Date()).muscles]);
  const [objective, setObjective] = useState('Ganar músculo');
  const [duration, setDuration] = useState('60');
  const [exerciseCount, setExerciseCount] = useState('2');
  const [limitation, setLimitation] = useState('Ninguna');
  const [preview, setPreview] = useState<RoutinePreview | null>(null);
  const [working, setWorking] = useState(false);
  const toggleMuscle = (muscle: string) => setSelectedMuscles((current) => current.includes(muscle) ? current.filter((item) => item !== muscle) : [...current, muscle]);
  const generate = async () => {
    if (selectedMuscles.length === 0) { showToast({ type: 'warning', title: 'Selecciona músculos', message: 'Elige al menos un grupo muscular.' }); return; }
    setWorking(true);
    try { setPreview(await previewRoutine({ muscles: selectedMuscles, durationMinutes: Number(duration), exercisesPerMuscle: Number(exerciseCount) })); } catch (reason) { showToast({ type: 'error', title: 'No se pudo generar', message: reason instanceof Error ? reason.message : 'Prueba otra selección.' }); } finally { setWorking(false); }
  };
  const accept = async () => {
    if (!preview) return;
    setWorking(true);
    try { await acceptRoutine(preview); setPreview(null); showToast({ type: 'success', title: 'Rutina guardada', message: 'Será la rutina usada al iniciar tu próxima sesión.' }); } catch (reason) { showToast({ type: 'error', title: 'No se pudo guardar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); } finally { setWorking(false); }
  };
  return <Screen><ScreenHeader title="Coach" subtitle="Generador local provisional · sin IA" /><Card style={styles.intro}><Text style={styles.introTitle}>Tu rutina, a tu medida</Text><Text style={styles.introText}>Filtra el catálogo real y crea una previsualización sencilla que puedes guardar en SQLite.</Text></Card><ChoiceField title="Nivel" options={['Principiante', 'Intermedio', 'Avanzado']} value={level} onChange={setLevel} /><ChoiceField title="Objetivo" options={objectives} value={objective} onChange={setObjective} /><ChoiceField title="Duración" options={durations} value={duration} onChange={setDuration} suffix=" min" /><View style={styles.section}><SectionTitle>Músculos a entrenar</SectionTitle><View style={styles.chips}>{muscles.map((item) => <Chip key={item} label={item} selected={selectedMuscles.includes(item)} onPress={() => toggleMuscle(item)} />)}</View></View><ChoiceField title="Ejercicios por músculo" options={exerciseCounts} value={exerciseCount} onChange={setExerciseCount} suffix=" ejercicios" /><ChoiceField title="Lesiones o limitaciones" options={limitations} value={limitation} onChange={setLimitation} />{limitation !== 'Ninguna' ? <Text style={styles.warning}>La limitación queda seleccionada localmente, pero esta versión provisional todavía no evalúa seguridad clínica.</Text> : null}{preview ? <Card style={styles.preview}><View><Text style={styles.previewTitle}>{preview.name}</Text><Text style={styles.previewMeta}>≈ {preview.estimatedMinutes} min · {preview.exercises.length} ejercicios · vista previa local</Text></View>{preview.exercises.map((exercise, index) => <View key={exercise.exerciseId} style={styles.previewRow}><Text style={styles.previewNumber}>{index + 1}</Text><View style={styles.previewCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMuscle}>{exercise.muscle}</Text></View></View>)}<View style={styles.actions}><View style={styles.flex}><SecondaryButton title="Cancelar" onPress={() => setPreview(null)} /></View><View style={styles.flex}><SecondaryButton icon="refresh" title="Regenerar" onPress={() => void generate()} /></View></View><PrimaryButton icon="save-outline" loading={working} title="Aceptar y guardar" onPress={() => void accept()} /></Card> : <PrimaryButton icon="sparkles-outline" loading={working} title="Generar rutina" onPress={() => void generate()} />}<Text style={styles.disclaimer}>Sin OpenAI · sin IA · selección local básica desde el catálogo</Text></Screen>;
}

function ChoiceField({ title, options, value, onChange, suffix = '' }: { title: string; options: string[]; value: string; onChange: (value: string) => void; suffix?: string }) { return <View style={styles.section}><SectionTitle>{title}</SectionTitle><View style={styles.chips}>{options.map((option) => <Chip key={option} label={`${option}${suffix}`} selected={value === option} onPress={() => onChange(option)} />)}</View></View>; }
const styles = StyleSheet.create({ intro: { backgroundColor: colors.primarySoft, borderColor: '#415827' }, introTitle: { ...typography.heading, color: colors.primary }, introText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm }, section: { gap: spacing.md }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, preview: { gap: spacing.lg }, previewTitle: { ...typography.title, color: colors.text }, previewMeta: { ...typography.caption, color: colors.primary, marginTop: spacing.xs }, previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, previewNumber: { ...typography.label, color: colors.primary, width: 20 }, previewCopy: { flex: 1 }, exerciseName: { ...typography.body, color: colors.text, fontWeight: '700' }, exerciseMuscle: { ...typography.caption, color: colors.textMuted }, actions: { flexDirection: 'row', gap: spacing.sm }, flex: { flex: 1 }, warning: { ...typography.caption, color: colors.warning }, disclaimer: { ...typography.caption, color: colors.textSubtle, textAlign: 'center', marginTop: -spacing.md } });
