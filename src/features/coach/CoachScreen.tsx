import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Chip, PrimaryButton, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';

const muscles = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps'];

export function CoachScreen() {
  const [level, setLevel] = useState('Intermedio');
  const [selectedMuscles, setSelectedMuscles] = useState(['Pecho', 'Tríceps']);
  const toggleMuscle = (muscle: string) => setSelectedMuscles((current) => current.includes(muscle) ? current.filter((item) => item !== muscle) : [...current, muscle]);

  return (
    <Screen>
      <ScreenHeader title="Coach" subtitle="Diseña tu próxima sesión" />
      <Card style={styles.intro}><Text style={styles.introTitle}>Tu rutina, a tu medida</Text><Text style={styles.introText}>Configura tus preferencias. La generación inteligente se conectará en una futura versión.</Text></Card>
      <View style={styles.section}><SectionTitle>Nivel</SectionTitle><View style={styles.chips}>{['Principiante', 'Intermedio', 'Avanzado'].map((item) => <Chip key={item} label={item} selected={level === item} onPress={() => setLevel(item)} />)}</View></View>
      <Option title="Objetivo" value="Ganar masa muscular" />
      <Option title="Duración" value="60 minutos" />
      <View style={styles.section}><SectionTitle>Músculos a entrenar</SectionTitle><View style={styles.chips}>{muscles.map((item) => <Chip key={item} label={item} selected={selectedMuscles.includes(item)} onPress={() => toggleMuscle(item)} />)}</View></View>
      <View style={styles.twoColumns}><Option compact title="Ejercicios por músculo" value="3 ejercicios" /><Option compact title="Lesiones o limitaciones" value="Ninguna" /></View>
      <PrimaryButton icon="sparkles-outline" title="Generar rutina" />
      <Text style={styles.disclaimer}>Vista previa visual · Coach IA aún no conectado</Text>
    </Screen>
  );
}

function Option({ title, value, compact }: { title: string; value: string; compact?: boolean }) {
  return <View style={[styles.section, compact && styles.compact]}><SectionTitle>{title}</SectionTitle><View style={styles.select}><Text numberOfLines={1} style={styles.selectText}>{value}</Text><Text style={styles.chevron}>⌄</Text></View></View>;
}

const styles = StyleSheet.create({
  intro: { backgroundColor: colors.primarySoft, borderColor: '#415827' }, introTitle: { ...typography.heading, color: colors.primary }, introText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm }, section: { gap: spacing.md }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, select: { minHeight: 52, paddingHorizontal: spacing.lg, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' }, selectText: { ...typography.body, color: colors.text, flex: 1 }, chevron: { color: colors.textMuted, fontSize: 20 }, twoColumns: { flexDirection: 'row', gap: spacing.md }, compact: { flex: 1 }, disclaimer: { ...typography.caption, color: colors.textSubtle, textAlign: 'center', marginTop: -spacing.md },
});
