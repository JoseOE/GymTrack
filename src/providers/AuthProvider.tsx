import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { AccountProfile, AuthDeepLinkState, SignUpInput, SignUpResult } from '@/domain/auth';
import { supabase } from '@/lib/supabase';
import { exchangeAuthDeepLink, getAuthDeepLinkPurpose, PASSWORD_RECOVERY_REDIRECT, SIGNUP_CONFIRMATION_REDIRECT } from '@/services/authDeepLinkService';
import { getOrCreateAccountProfile, updateAccountProfile } from '@/supabase/profilesRepository';

type AuthContextValue = {
  loading: boolean;
  error: string | null;
  session: Session | null;
  user: User | null;
  accountProfile: AccountProfile | null;
  isAuthenticated: boolean;
  authDeepLink: AuthDeepLinkState;
  passwordRecovery: boolean;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateRecoveredPassword: (password: string) => Promise<void>;
  completeOnboarding: (displayName: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  refreshAccountProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const idleDeepLink: AuthDeepLinkState = { status: 'idle', purpose: null, message: null };

function authMessage(reason: unknown) {
  if (!(reason instanceof Error)) return 'No se pudo completar la operación.';
  const message = reason.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (message.includes('user already registered')) return 'Ya existe una cuenta con ese correo.';
  if (message.includes('password')) return 'La contraseña no cumple los requisitos de seguridad.';
  if (message.includes('network')) return 'No hay conexión con el servicio de cuenta.';
  return reason.message;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null);
  const [authDeepLink, setAuthDeepLink] = useState<AuthDeepLinkState>(idleDeepLink);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const hydrationId = useRef(0);
  const hydratedUserId = useRef<string | null>(null);
  const handledAuthLinks = useRef(new Set<string>());
  const passwordRecoveryEventCount = useRef(0);

  const hydrate = useCallback(async (nextSession: Session | null) => {
    const requestId = ++hydrationId.current;
    setSession(nextSession);
    if (!nextSession?.user) {
      hydratedUserId.current = null;
      setAccountProfile(null);
      setError(null);
      setLoading(false);
      return;
    }
    if (hydratedUserId.current !== nextSession.user.id) setLoading(true);
    hydratedUserId.current = nextSession.user.id;
    try {
      const profile = await getOrCreateAccountProfile(nextSession.user);
      if (requestId !== hydrationId.current) return;
      setAccountProfile(profile);
      setError(null);
    } catch (reason) {
      if (requestId !== hydrationId.current) return;
      setAccountProfile(null);
      setError(authMessage(reason));
    } finally {
      if (requestId === hydrationId.current) setLoading(false);
    }
  }, []);

  const handleAuthDeepLink = useCallback(async (url: string) => {
    if (handledAuthLinks.current.has(url)) return;
    handledAuthLinks.current.add(url);
    let purpose: AuthDeepLinkState['purpose'] = getAuthDeepLinkPurpose(url);
    if (!purpose) return;
    setAuthDeepLink({ status: 'processing', purpose, message: null });
    try {
      const recoveryEventsBeforeExchange = passwordRecoveryEventCount.current;
      const result = await exchangeAuthDeepLink(url);
      if (!result) return;
      purpose = result.purpose;
      const recoveryEvent = passwordRecoveryEventCount.current > recoveryEventsBeforeExchange;
      if ((purpose === 'recovery') !== recoveryEvent) throw new Error('El enlace no corresponde al flujo solicitado.');
      if (purpose === 'recovery') setPasswordRecovery(true);
      await hydrate(result.session);
      setAuthDeepLink({
        status: 'success',
        purpose,
        message: purpose === 'recovery' ? 'Ya puedes elegir una contraseña nueva.' : 'Tu correo quedó confirmado correctamente.',
      });
    } catch (reason) {
      setPasswordRecovery(false);
      setAuthDeepLink({ status: 'error', purpose, message: authMessage(reason) });
    }
  }, [hydrate]);

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        passwordRecoveryEventCount.current += 1;
        setPasswordRecovery(true);
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false);
        setAuthDeepLink(idleDeepLink);
      }
      setTimeout(() => { if (mounted) void hydrate(nextSession); }, 0);
    });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => { if (mounted) void handleAuthDeepLink(url); });
    void (async () => {
      const initialUrl = await Linking.getInitialURL().catch(() => null);
      if (mounted && initialUrl) await handleAuthDeepLink(initialUrl);
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;
      if (sessionError) {
        setError(authMessage(sessionError));
        setLoading(false);
        return;
      }
      await hydrate(data.session);
    })();
    return () => { mounted = false; subscription.unsubscribe(); linkSubscription.remove(); };
  }, [handleAuthDeepLink, hydrate]);

  const refreshAccountProfile = useCallback(async () => {
    if (!session?.user) return;
    try {
      setAccountProfile(await getOrCreateAccountProfile(session.user));
      setError(null);
    } catch (reason) {
      setAccountProfile(null);
      setError(authMessage(reason));
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    error,
    session,
    user: session?.user ?? null,
    accountProfile,
    isAuthenticated: Boolean(session?.user),
    authDeepLink,
    passwordRecovery,
    signUp: async ({ displayName, email, password }) => {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { display_name: displayName.trim() }, emailRedirectTo: SIGNUP_CONFIRMATION_REDIRECT },
      });
      if (signUpError) throw new Error(authMessage(signUpError));
      return { requiresEmailConfirmation: !data.session };
    },
    signIn: async (email, password) => {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signInError) throw new Error(authMessage(signInError));
    },
    signOut: async () => {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw new Error(authMessage(signOutError));
      await hydrate(null);
    },
    resetPassword: async (email) => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: PASSWORD_RECOVERY_REDIRECT });
      if (resetError) throw new Error(authMessage(resetError));
    },
    updateRecoveredPassword: async (password) => {
      if (!passwordRecovery || !session?.user) throw new Error('Abre un enlace de recuperación válido antes de continuar.');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(authMessage(updateError));
      setPasswordRecovery(false);
      setAuthDeepLink(idleDeepLink);
    },
    completeOnboarding: async (displayName) => {
      if (!session?.user) throw new Error('La sesión ya no está disponible.');
      setAccountProfile(await updateAccountProfile(session.user.id, { displayName, onboardingCompleted: true }));
    },
    updateDisplayName: async (displayName) => {
      if (!session?.user) throw new Error('La sesión ya no está disponible.');
      setAccountProfile(await updateAccountProfile(session.user.id, { displayName }));
    },
    refreshAccountProfile,
  }), [accountProfile, authDeepLink, error, hydrate, loading, passwordRecovery, refreshAccountProfile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
