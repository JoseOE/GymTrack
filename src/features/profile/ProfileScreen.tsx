import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Chip, IconButton, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionTitle } from '@/components/ui';
import { getDayMetadata } from '@/constants/workoutSchedule';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { ExperienceLevel, Goal, UserProfile, WeeklyPlan } from '@/domain/models';
import { useAuth } from '@/providers/AuthProvider';
import { useFeedback } from '@/providers/FeedbackProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

const goals: Goal[] = ['Ganar músculo', 'Ganar fuerza', 'Perder grasa', 'Mejorar condición física', 'Salud general'];
const levels: ExperienceLevel[] = ['Principiante', 'Intermedio', 'Avanzado'];
const durations = [30, 45, 60, 75, 90];

export function ProfileScreen() {
  const { signOut, user } = useAuth();
  const { profile, updateProfile, weeklyPlan } = useGymTrack();
  if (!profile || !weeklyPlan) return <Screen><ScreenHeader title="Perfil" subtitle="Cargando perfil local…" /></Screen>;
  return <ProfileForm email={user?.email ?? 'Correo no disponible'} emailConfirmed={Boolean(user?.email_confirmed_at)} key={profile.updatedAt} profile={profile} signOut={signOut} updateProfile={updateProfile} weeklyPlan={weeklyPlan} />;
}

function ProfileForm({ profile, weeklyPlan, email, emailConfirmed, updateProfile, signOut }: { profile: UserProfile; weeklyPlan: WeeklyPlan; email: string; emailConfirmed: boolean; updateProfile: (profile: UserProfile) => Promise<void>; signOut: () => Promise<void> }) {
  const { confirm, showToast } = useFeedback();
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
  const requestSignOut = () => confirm({ title: '¿Cerrar sesión?', message: 'No perderás tus datos guardados en este dispositivo.', confirmLabel: 'Cerrar sesión', cancelLabel: 'Cancelar', tone: 'warning', icon: 'log-out-outline', onConfirm: signOut });
  return <Screen><ScreenHeader title="Perfil" subtitle="Configuración local" action={<IconButton icon="close" label="Cerrar perfil" onPress={() => router.back()} />} /><View style={styles.field}><Text style={styles.label}>Nombre</Text><TextInput autoCapitalize="words" onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={colors.textSubtle} style={styles.input} value={name} /></View><View style={styles.row}><View style={styles.flex}><Text style={styles.label}>Estatura (cm)</Text><TextInput keyboardType="decimal-pad" onChangeText={setHeight} style={styles.input} value={height} /></View><View style={styles.flex}><Text style={styles.label}>Peso (kg)</Text><TextInput keyboardType="decimal-pad" onChangeText={setWeight} style={styles.input} value={weight} /></View></View><Choice title="Objetivo" options={goals} value={goal} onChange={(value) => setGoal(value as Goal)} /><Choice title="Nivel" options={levels} value={level} onChange={(value) => setLevel(value as ExperienceLevel)} /><View style={styles.field}><SectionTitle>Duración habitual</SectionTitle><View style={styles.chips}>{durations.map((item) => <Chip key={item} label={`${item} min`} selected={duration === item} onPress={() => setDuration(item)} />)}</View></View><PlanSummary plan={weeklyPlan} /><PrimaryButton icon="save-outline" loading={saving} title="Guardar cambios" onPress={() => void handleSave()} /><View style={styles.field}><SectionTitle>Mi cuenta</SectionTitle><Card style={styles.account}><Text style={styles.accountEmail}>{email}</Text><Text style={[styles.accountStatus, { color: emailConfirmed ? colors.success : colors.warning }]}>{emailConfirmed ? 'Correo confirmado' : 'Confirmación de correo pendiente'}</Text></Card><SecondaryButton icon="log-out-outline" title="Cerrar sesión" tone="danger" onPress={requestSignOut} /></View><Text style={styles.security}>Solo se guardan preferencias de entrenamiento en SQLite. No se almacenan contraseñas ni credenciales.</Text></Screen>;
}

function PlanSummary({ plan }: { plan: WeeklyPlan }) {
  const days = plan.days.slice().sort((left, right) => (left.dayIndex || 7) - (right.dayIndex || 7));
  return <View style={styles.field}><SectionTitle detail={plan.source === 'default' ? 'PREDETERMINADO' : 'PERSONALIZADO'}>Mi plan semanal</SectionTitle><Card style={styles.planCard}>{days.map((day) => <View key={day.id} style={styles.planDay}><Text style={styles.planDayName}>{getDayMetadata(day.dayIndex).dayName}</Text><Text style={styles.planName}>{day.displayName}</Text></View>)}</Card><SecondaryButton icon="calendar-outline" title="Editar plan semanal" onPress={() => router.push('/weekly-plan')} /></View>;
}

function Choice({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (value: string) => void }) { return <View style={styles.field}><SectionTitle>{title}</SectionTitle><View style={styles.chips}>{options.map((option) => <Chip key={option} label={option} selected={value === option} onPress={() => onChange(option)} />)}</View></View>; }
const styles = StyleSheet.create({ field: { gap: spacing.md }, row: { flexDirection: 'row', gap: spacing.md }, flex: { flex: 1, gap: spacing.sm }, label: { ...typography.label, color: colors.textMuted }, input: { ...typography.body, minHeight: 50, borderRadius: radii.md, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.text, paddingHorizontal: spacing.lg }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, planCard: { gap: spacing.md }, planDay: { gap: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: spacing.sm }, planDayName: { ...typography.label, color: colors.primary }, planName: { ...typography.caption, color: colors.text }, account: { gap: spacing.xs }, accountEmail: { ...typography.body, color: colors.text, fontWeight: '700' }, accountStatus: { ...typography.caption }, security: { ...typography.caption, color: colors.textSubtle, textAlign: 'center' } });
