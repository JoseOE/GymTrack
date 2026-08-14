import { PrimaryButton } from '@/components/ui';
import { AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/providers/AuthProvider';

export function AccountErrorScreen() {
  const { error, refreshAccountProfile, signOut } = useAuth();
  return <AuthShell title="No pudimos cargar tu cuenta" subtitle={error ?? 'Revisa la conexión y vuelve a intentarlo.'}><PrimaryButton icon="refresh" title="Reintentar" onPress={() => void refreshAccountProfile()} /><PrimaryButton icon="log-out-outline" title="Cerrar sesión" onPress={() => void signOut()} /></AuthShell>;
}
