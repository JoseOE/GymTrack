import type { ExerciseMode, WarmUpPlan } from '@/domain/models';

type WarmUpExercise = {
  name: string;
  mode: ExerciseMode;
};

export function createWarmUpPlan(exercises: WarmUpExercise[]): WarmUpPlan | null {
  const firstStrengthExercise = exercises.find((exercise) => exercise.mode === 'strength');
  if (firstStrengthExercise) {
    return {
      kind: 'strength',
      estimatedMinutes: 7,
      steps: [
        {
          title: 'Activación general',
          durationLabel: '≈ 3–5 min',
          description: 'Movilidad y movimiento ligero antes de comenzar.',
        },
        {
          title: 'Series de aproximación',
          durationLabel: '1–2 series',
          description: `Realiza 1–2 series de aproximación de ${firstStrengthExercise.name} con una carga ligera y progresiva, sin llegar al fallo.`,
        },
      ],
    };
  }

  const cardioExercise = exercises.find((exercise) => exercise.mode === 'cardio');
  if (!cardioExercise) return null;
  return {
    kind: 'cardio',
    estimatedMinutes: 5,
    steps: [{
      title: `Activación en ${cardioExercise.name}`,
      durationLabel: '≈ 3–5 min',
      description: 'Comienza a intensidad muy suave en la misma máquina antes de entrar en tu ritmo objetivo. Este tiempo no resta minutos a tu objetivo de Cardio.',
    }],
  };
}
