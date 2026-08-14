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
