import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Chip, PrimaryButton, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';

const muscles = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps'];
const objectives = ['Ganar músculo', 'Ganar fuerza', 'Perder grasa'];
const durations = ['30 min', '45 min', '60 min', '75 min'];
const exerciseCounts = ['2', '3', '4'];
const limitations = ['Ninguna', 'Hombro', 'Rodilla', 'Espalda'];

export function CoachScreen() {
  const [level, setLevel] = useState('Intermedio');
  const [selectedMuscles, setSelectedMuscles] = useState(['Pecho', 'Tríceps']);
  const [objective, setObjective] = useState('Ganar músculo');
  const [duration, setDuration] = useState('60 min');
  const [exerciseCount, setExerciseCount] = useState('3');
  const [limitation, setLimitation] = useState('Ninguna');
  const toggleMuscle = (muscle: string) => setSelectedMuscles((current) => current.includes(muscle) ? current.filter((item) => item !== muscle) : [...current, muscle]);

  return (
    <Screen>
      <ScreenHeader title="Coach" subtitle="Diseña tu próxima sesión" />
      <Card style={styles.intro}><Text style={styles.introTitle}>Tu rutina, a tu medida</Text><Text style={styles.introText}>Configura tus preferencias. La generación inteligente se conectará en una futura versión.</Text></Card>
      <ChoiceField title="Nivel" options={['Principiante', 'Intermedio', 'Avanzado']} value={level} onChange={setLevel} />
      <ChoiceField title="Objetivo" options={objectives} value={objective} onChange={setObjective} />
      <ChoiceField title="Duración" options={durations} value={duration} onChange={setDuration} />
      <View style={styles.section}><SectionTitle>Músculos a entrenar</SectionTitle><View style={styles.chips}>{muscles.map((item) => <Chip key={item} label={item} selected={selectedMuscles.includes(item)} onPress={() => toggleMuscle(item)} />)}</View></View>
      <ChoiceField title="Ejercicios por músculo" options={exerciseCounts} value={exerciseCount} onChange={setExerciseCount} optionSuffix=" ejercicios" />
      <ChoiceField title="Lesiones o limitaciones" options={limitations} value={limitation} onChange={setLimitation} />
      <PrimaryButton icon="sparkles-outline" title="Generar rutina" />
      <Text style={styles.disclaimer}>Vista previa visual · Coach IA aún no conectado</Text>
    </Screen>
  );
}

function ChoiceField({ title, options, value, onChange, optionSuffix = '' }: { title: string; options: string[]; value: string; onChange: (value: string) => void; optionSuffix?: string }) {
  return <View style={styles.section}><SectionTitle>{title}</SectionTitle><View style={styles.chips}>{options.map((option) => <Chip key={option} label={`${option}${optionSuffix}`} selected={value === option} onPress={() => onChange(option)} />)}</View></View>;
}

const styles = StyleSheet.create({
  intro: { backgroundColor: colors.primarySoft, borderColor: '#415827' }, introTitle: { ...typography.heading, color: colors.primary }, introText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm }, section: { gap: spacing.md }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, disclaimer: { ...typography.caption, color: colors.textSubtle, textAlign: 'center', marginTop: -spacing.md },
});
