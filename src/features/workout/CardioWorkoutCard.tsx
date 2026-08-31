import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { WorkoutExercise } from '@/domain/models';
import { formatDuration } from '@/utils/duration';
import { formatTimer, getCardioRemainingSeconds } from '@/utils/cardioTimer';

type Props = {
  exercise: WorkoutExercise;
  index: number;
  onStart: () => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onFinish: () => void;
  onExpire: () => Promise<void>;
};

export function CardioWorkoutCard({ exercise, index, onStart, onPause, onResume, onFinish, onExpire }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [working, setWorking] = useState(false);
  const expirationRequested = useRef(false);
  const targetMinutes = exercise.targetDurationMinutes ?? 0;
  const remainingSeconds = getCardioRemainingSeconds({
    state: exercise.cardioTimerState,
    targetDurationMinutes: targetMinutes,
    elapsedSeconds: exercise.cardioElapsedSeconds,
    lastStartedAt: exercise.cardioLastStartedAt,
  }, now);

  useEffect(() => {
    if (exercise.cardioTimerState !== 'running') return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [exercise.cardioTimerState]);

  useEffect(() => {
    if (exercise.cardioTimerState !== 'running' || remainingSeconds > 0 || expirationRequested.current) return;
    expirationRequested.current = true;
    void onExpire().finally(() => { expirationRequested.current = false; });
  }, [exercise.cardioTimerState, onExpire, remainingSeconds]);

  const run = async (action: () => Promise<void>) => {
    setWorking(true);
    try { await action(); } finally { setWorking(false); }
  };

  const completedMinutes = exercise.cardioElapsedSeconds / 60;
  return <Card style={styles.card}>
    <View style={styles.header}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><View style={styles.copy}><Text style={styles.name}>{exercise.name}</Text><Text style={styles.muscle}>Cardio</Text></View></View>
    <View style={styles.target}><Text style={styles.label}>OBJETIVO</Text><Text style={styles.targetValue}>{formatDuration(targetMinutes)}</Text></View>
    {exercise.cardioTimerState === 'completed' ? <View style={styles.completed}><Ionicons color={colors.primary} name="checkmark-circle" size={32} /><Text style={styles.completedTitle}>Cardio completado</Text><Text style={styles.completedMeta}>{formatDuration(completedMinutes)}</Text></View> : <>
      {exercise.cardioTimerState === 'paused' ? <Text style={styles.paused}>PAUSADO</Text> : null}
      <Text style={styles.timer}>{formatTimer(remainingSeconds)}</Text>
      <Text style={styles.remaining}>{exercise.cardioTimerState === 'idle' ? 'listo para comenzar' : 'restantes'}</Text>
      {exercise.cardioTimerState === 'idle' ? <PrimaryButton icon="play" loading={working} title="Iniciar cardio" onPress={() => void run(onStart)} /> : null}
      {exercise.cardioTimerState === 'running' ? <PrimaryButton icon="pause" loading={working} title="Pausar" onPress={() => void run(onPause)} /> : null}
      {exercise.cardioTimerState === 'paused' ? <PrimaryButton icon="play" loading={working} title="Continuar" onPress={() => void run(onResume)} /> : null}
      {exercise.cardioTimerState !== 'idle' ? <SecondaryButton disabled={working} icon="stop-circle-outline" title="Finalizar cardio" onPress={onFinish} /> : null}
    </>}
  </Card>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center' },
  number: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  numberText: { ...typography.body, color: colors.primary, fontWeight: '800' },
  copy: { flex: 1 },
  name: { ...typography.heading, color: colors.text },
  muscle: { ...typography.caption, color: colors.textMuted },
  target: { alignItems: 'center', gap: spacing.xs },
  label: { ...typography.label, color: colors.textSubtle, letterSpacing: 0.8 },
  targetValue: { ...typography.body, color: colors.text },
  timer: { ...typography.display, color: colors.primary, textAlign: 'center', fontVariant: ['tabular-nums'] },
  remaining: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: -spacing.md },
  paused: { ...typography.label, color: colors.warning, textAlign: 'center', letterSpacing: 1 },
  completed: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  completedTitle: { ...typography.heading, color: colors.text },
  completedMeta: { ...typography.body, color: colors.primary },
});
