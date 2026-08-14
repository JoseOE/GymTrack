export type AccountProfile = {
  id: string;
  displayName: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SignUpInput = {
  displayName: string;
  email: string;
  password: string;
};

export type SignUpResult = {
  requiresEmailConfirmation: boolean;
};

export type AuthDeepLinkPurpose = 'signup' | 'recovery';

export type AuthDeepLinkState = {
  status: 'idle' | 'processing' | 'success' | 'error';
  purpose: AuthDeepLinkPurpose | null;
  message: string | null;
};
