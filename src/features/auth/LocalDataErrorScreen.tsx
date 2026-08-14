import { PrimaryButton } from '@/components/ui';
import { AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/providers/AuthProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

export function LocalDataErrorScreen() {
  const { signOut } = useAuth();
  const { error, refresh } = useGymTrack();
  return <AuthShell title="No pudimos abrir tus datos locales" subtitle={error ?? 'La cuenta está activa, pero SQLite no pudo preparar este espacio.'}><PrimaryButton icon="refresh" title="Reintentar" onPress={() => void refresh()} /><PrimaryButton icon="log-out-outline" title="Cerrar sesión" onPress={() => void signOut()} /></AuthShell>;
}
