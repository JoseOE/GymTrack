export type PostAuthDestination = '/login' | '/account-error' | '/legacy-data' | '/local-data-error' | '/onboarding' | '/(tabs)';

type PostAuthState = {
  isAuthenticated: boolean;
  hasAccountProfile: boolean;
  accountError: string | null;
  legacyMigrationRequired: boolean;
  localReady: boolean;
  localError: string | null;
  onboardingCompleted: boolean;
};

export function getPostAuthDestination(state: PostAuthState): PostAuthDestination {
  if (!state.isAuthenticated) return '/login';
  if (!state.hasAccountProfile || state.accountError) return '/account-error';
  if (state.legacyMigrationRequired) return '/legacy-data';
  if (!state.localReady || state.localError) return '/local-data-error';
  if (!state.onboardingCompleted) return '/onboarding';
  return '/(tabs)';
}
