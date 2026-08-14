import { useAuth } from '@/providers/AuthProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';
import { getPostAuthDestination } from '@/services/postAuthNavigation';

export function usePostAuthDestination() {
  const auth = useAuth();
  const local = useGymTrack();
  return getPostAuthDestination({
    isAuthenticated: auth.isAuthenticated,
    hasAccountProfile: Boolean(auth.accountProfile),
    accountError: auth.error,
    legacyMigrationRequired: local.legacyMigrationRequired,
    localReady: local.localReady,
    localError: local.error,
    onboardingCompleted: Boolean(auth.accountProfile?.onboardingCompleted),
  });
}
