import type { Session, User } from '@supabase/supabase-js';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { AccountProfile, SignUpInput, SignUpResult } from '@/domain/auth';
import { supabase } from '@/lib/supabase';
import { getOrCreateAccountProfile, updateAccountProfile } from '@/supabase/profilesRepository';

type AuthContextValue = {
  loading: boolean;
  error: string | null;
  session: Session | null;
  user: User | null;
  accountProfile: AccountProfile | null;
  isAuthenticated: boolean;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeOnboarding: (displayName: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  refreshAccountProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const hydrationId = useRef(0);
  const hydratedUserId = useRef<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        setError(authMessage(sessionError));
        setLoading(false);
        return;
      }
      void hydrate(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => { if (mounted) void hydrate(nextSession); }, 0);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [hydrate]);

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
    signUp: async ({ displayName, email, password }) => {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { display_name: displayName.trim() } },
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (resetError) throw new Error(authMessage(resetError));
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
  }), [accountProfile, error, hydrate, loading, refreshAccountProfile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
