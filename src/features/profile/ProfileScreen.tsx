import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip, IconButton, PrimaryButton, Screen, ScreenHeader, SectionTitle } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { ExperienceLevel, Goal, UserProfile } from '@/domain/models';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

const goals: Goal[] = ['Ganar músculo', 'Ganar fuerza', 'Perder grasa', 'Mejorar salud'];
const levels: ExperienceLevel[] = ['Principiante', 'Intermedio', 'Avanzado'];
const durations = [30, 45, 60, 75, 90];

export function ProfileScreen() {
  const { profile, updateProfile } = useGymTrack();
  if (!profile) return <Screen><ScreenHeader title="Perfil" subtitle="Cargando perfil local…" /></Screen>;
  return <ProfileForm key={profile.updatedAt} profile={profile} updateProfile={updateProfile} />;
}

function ProfileForm({ profile, updateProfile }: { profile: UserProfile; updateProfile: (profile: UserProfile) => Promise<void> }) {
  const { showToast } = useFeedback();
  const [name, setName] = useState(profile.displayName);
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [level, setLevel] = useState<ExperienceLevel>(profile.experienceLevel);
  const [duration, setDuration] = useState(profile.defaultWorkoutMinutes);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    const heightCm = Number(height.replace(',', '.'));
    const weightKg = Number(weight.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(heightCm) || heightCm <= 0 || !Number.isFinite(weightKg) || weightKg <= 0) { showToast({ type: 'warning', title: 'Revisa tus datos', message: 'Nombre, estatura y peso deben tener valores válidos.' }); return; }
    setSaving(true);
    try { await updateProfile({ ...profile, displayName: name.trim(), heightCm, weightKg, goal, experienceLevel: level, defaultWorkoutMinutes: duration }); showToast({ type: 'success', title: 'Perfil guardado', message: 'Tus preferencias quedaron guardadas en este dispositivo.' }); } catch (reason) { showToast({ type: 'error', title: 'No se pudo guardar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' }); } finally { setSaving(false); }
  };
  return <Screen><ScreenHeader title="Perfil" subtitle="Configuración local" action={<IconButton icon="close" label="Cerrar perfil" onPress={() => router.back()} />} /><View style={styles.field}><Text style={styles.label}>Nombre</Text><TextInput autoCapitalize="words" onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={colors.textSubtle} style={styles.input} value={name} /></View><View style={styles.row}><View style={styles.flex}><Text style={styles.label}>Estatura (cm)</Text><TextInput keyboardType="decimal-pad" onChangeText={setHeight} style={styles.input} value={height} /></View><View style={styles.flex}><Text style={styles.label}>Peso (kg)</Text><TextInput keyboardType="decimal-pad" onChangeText={setWeight} style={styles.input} value={weight} /></View></View><Choice title="Objetivo" options={goals} value={goal} onChange={(value) => setGoal(value as Goal)} /><Choice title="Nivel" options={levels} value={level} onChange={(value) => setLevel(value as ExperienceLevel)} /><View style={styles.field}><SectionTitle>Duración habitual</SectionTitle><View style={styles.chips}>{durations.map((item) => <Chip key={item} label={`${item} min`} selected={duration === item} onPress={() => setDuration(item)} />)}</View></View><PrimaryButton icon="save-outline" loading={saving} title="Guardar cambios" onPress={() => void handleSave()} /><Text style={styles.security}>Solo se guarda tu perfil de gimnasio. No se almacenan contraseñas ni credenciales.</Text></Screen>;
}

function Choice({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (value: string) => void }) { return <View style={styles.field}><SectionTitle>{title}</SectionTitle><View style={styles.chips}>{options.map((option) => <Chip key={option} label={option} selected={value === option} onPress={() => onChange(option)} />)}</View></View>; }
const styles = StyleSheet.create({ field: { gap: spacing.md }, row: { flexDirection: 'row', gap: spacing.md }, flex: { flex: 1, gap: spacing.sm }, label: { ...typography.label, color: colors.textMuted }, input: { ...typography.body, minHeight: 50, borderRadius: radii.md, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.text, paddingHorizontal: spacing.lg }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, security: { ...typography.caption, color: colors.textSubtle, textAlign: 'center' } });
