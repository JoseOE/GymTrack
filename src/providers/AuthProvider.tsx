import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { AccountProfile, AuthDeepLinkState, SignUpInput, SignUpResult } from '@/domain/auth';
import { SIGN_UP_OTP_LENGTH } from '@/constants/auth';
import { supabase } from '@/lib/supabase';
import { exchangeAuthDeepLink, getAuthDeepLinkPurpose, PASSWORD_RECOVERY_REDIRECT, SIGNUP_CONFIRMATION_REDIRECT } from '@/services/authDeepLinkService';
import { getOrCreateAccountProfile, updateAccountProfile } from '@/supabase/profilesRepository';

type AuthContextValue = {
  loading: boolean;
  authLinkInitialized: boolean;
  error: string | null;
  session: Session | null;
  user: User | null;
  accountProfile: AccountProfile | null;
  isAuthenticated: boolean;
  authDeepLink: AuthDeepLinkState;
  passwordRecovery: boolean;
  pendingSignUpEmail: string | null;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  resendSignUpConfirmation: (email: string) => Promise<void>;
  verifySignUpOtp: (email: string, token: string) => Promise<void>;
  clearPendingSignUpEmail: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateRecoveredPassword: (password: string) => Promise<void>;
  completeOnboarding: (displayName: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  refreshAccountProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const idleDeepLink: AuthDeepLinkState = { status: 'idle', purpose: null, message: null, outcome: null };
const alreadyConfirmedDeepLink: AuthDeepLinkState = {
  status: 'success',
  purpose: 'signup',
  message: 'Este enlace ya fue utilizado. Puedes continuar usando GymTrack.',
  outcome: 'already-confirmed',
};
const RECOVERY_EVENT_TIMEOUT_MS = 2000;

type RecoveryEventWaiter = {
  promise: Promise<Session | null>;
  resolve: (session: Session | null) => void;
};

function createRecoveryEventWaiter(): RecoveryEventWaiter {
  let resolve!: (session: Session | null) => void;
  const promise = new Promise<Session | null>((nextResolve) => { resolve = nextResolve; });
  return { promise, resolve };
}

function waitForRecoveryEvent(promise: Promise<Session | null>) {
  return new Promise<Session | null>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Supabase no confirmó el flujo de recuperación. Solicita un enlace nuevo.')), RECOVERY_EVENT_TIMEOUT_MS);
    void promise.then(
      (session) => { clearTimeout(timeout); resolve(session); },
      (reason: unknown) => { clearTimeout(timeout); reject(reason); },
    );
  });
}

function hasConfirmedEmail(nextSession: Session | null) {
  return Boolean(nextSession?.user.email_confirmed_at);
}

function authMessage(reason: unknown) {
  if (!(reason instanceof Error)) return 'No se pudo completar la operación.';
  const message = reason.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (message.includes('otp') || message.includes('token has expired') || message.includes('invalid token')) return 'El código no es válido o ya expiró.';
  if (message.includes('user already registered')) return 'Ya existe una cuenta con ese correo.';
  if (message.includes('rate limit') || message.includes('too many requests') || message.includes('over_email_send_rate_limit')) return 'Espera un momento antes de solicitar otro correo.';
  if (message.includes('password')) return 'La contraseña no cumple los requisitos de seguridad.';
  if (message.includes('network')) return 'No hay conexión con el servicio de cuenta.';
  return reason.message;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [authLinkInitialized, setAuthLinkInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null);
  const [authDeepLink, setAuthDeepLink] = useState<AuthDeepLinkState>(idleDeepLink);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [pendingSignUpEmail, setPendingSignUpEmail] = useState<string | null>(null);
  const hydrationId = useRef(0);
  const hydratedUserId = useRef<string | null>(null);
  const handledAuthLinks = useRef(new Set<string>());
  const passwordRecoveryEventCount = useRef(0);
  const passwordRecoveryActive = useRef(false);
  const pendingRecoveryEvent = useRef<RecoveryEventWaiter | null>(null);

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
    if (hasConfirmedEmail(nextSession)) {
      setAuthDeepLink((current) => current.status === 'error' && current.purpose === 'signup' ? alreadyConfirmedDeepLink : current);
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
    setAuthDeepLink({ status: 'processing', purpose, message: null, outcome: null });
    const recoveryWaiter = purpose === 'recovery' ? createRecoveryEventWaiter() : null;
    if (recoveryWaiter) pendingRecoveryEvent.current = recoveryWaiter;
    try {
      const recoveryEventsBeforeExchange = passwordRecoveryEventCount.current;
      const result = await exchangeAuthDeepLink(url);
      if (!result) throw new Error('El enlace no contiene un callback de autenticación válido.');
      purpose = result.purpose;
      if (purpose === 'recovery') {
        const recoverySession = await waitForRecoveryEvent(recoveryWaiter?.promise ?? Promise.resolve(null));
        if (!recoverySession?.user || recoverySession.user.id !== result.session.user.id) {
          throw new Error('El enlace no corresponde al flujo solicitado.');
        }
        passwordRecoveryActive.current = true;
        setPasswordRecovery(true);
      } else if (passwordRecoveryEventCount.current > recoveryEventsBeforeExchange) {
        throw new Error('El enlace no corresponde al flujo solicitado.');
      }
      await hydrate(result.session);
      setAuthDeepLink({
        status: 'success',
        purpose,
        message: purpose === 'recovery' ? 'Ya puedes elegir una contraseña nueva.' : 'Tu correo quedó confirmado correctamente.',
        outcome: purpose === 'signup' ? 'confirmed' : null,
      });
    } catch (reason) {
      if (purpose === 'recovery') {
        passwordRecoveryActive.current = false;
        setPasswordRecovery(false);
      }
      if (purpose === 'signup') {
        const { data } = await supabase.auth.getSession();
        if (hasConfirmedEmail(data.session)) {
          await hydrate(data.session);
          setAuthDeepLink(alreadyConfirmedDeepLink);
          return;
        }
      }
      setAuthDeepLink({ status: 'error', purpose, message: authMessage(reason), outcome: null });
    } finally {
      if (pendingRecoveryEvent.current === recoveryWaiter) pendingRecoveryEvent.current = null;
    }
  }, [hydrate]);

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        passwordRecoveryEventCount.current += 1;
        passwordRecoveryActive.current = true;
        setPasswordRecovery(true);
        pendingRecoveryEvent.current?.resolve(nextSession);
      }
      if (event === 'SIGNED_OUT') {
        passwordRecoveryActive.current = false;
        setPasswordRecovery(false);
        setPendingSignUpEmail(null);
        setAuthDeepLink(idleDeepLink);
      }
      if (event === 'SIGNED_IN' && hasConfirmedEmail(nextSession)) {
        setPendingSignUpEmail(null);
        setAuthDeepLink((current) => current.status === 'error' && current.purpose === 'signup' ? idleDeepLink : current);
      }
      if (event === 'INITIAL_SESSION') return;
      setTimeout(() => { if (mounted) void hydrate(nextSession); }, 0);
    });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => { if (mounted) void handleAuthDeepLink(url); });
    void (async () => {
      try {
        const initialUrl = await Linking.getInitialURL().catch(() => null);
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionError) {
          setError(authMessage(sessionError));
          setLoading(false);
          return;
        }
        const initialPurpose = initialUrl ? getAuthDeepLinkPurpose(initialUrl) : null;
        if (initialUrl && initialPurpose === 'signup' && hasConfirmedEmail(data.session)) {
          handledAuthLinks.current.add(initialUrl);
          await hydrate(data.session);
          if (mounted) setAuthDeepLink(alreadyConfirmedDeepLink);
          return;
        }
        if (initialUrl && initialPurpose) await handleAuthDeepLink(initialUrl);
        if (!mounted) return;
        const { data: latestData, error: latestSessionError } = await supabase.auth.getSession();
        if (latestSessionError) {
          setError(authMessage(latestSessionError));
          setLoading(false);
          return;
        }
        await hydrate(latestData.session);
      } finally {
        if (mounted) setAuthLinkInitialized(true);
      }
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
    authLinkInitialized,
    error,
    session,
    user: session?.user ?? null,
    accountProfile,
    isAuthenticated: Boolean(session?.user),
    authDeepLink,
    passwordRecovery,
    pendingSignUpEmail,
    signUp: async ({ displayName, email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { display_name: displayName.trim() }, emailRedirectTo: SIGNUP_CONFIRMATION_REDIRECT },
      });
      if (signUpError) throw new Error(authMessage(signUpError));
      setPendingSignUpEmail(data.session ? null : normalizedEmail);
      return { requiresEmailConfirmation: !data.session };
    },
    resendSignUpConfirmation: async (email) => {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: { emailRedirectTo: SIGNUP_CONFIRMATION_REDIRECT },
      });
      if (resendError) throw new Error(authMessage(resendError));
      setPendingSignUpEmail(normalizedEmail);
    },
    verifySignUpOtp: async (email, token) => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedToken = token.replace(/\D/g, '');
      if (normalizedToken.length !== SIGN_UP_OTP_LENGTH) throw new Error(`Escribe el código completo de ${SIGN_UP_OTP_LENGTH} dígitos.`);
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: normalizedToken,
        type: 'email',
      });
      if (verifyError) throw new Error(authMessage(verifyError));
      if (!data.session) throw new Error('Supabase no devolvió una sesión válida después de verificar el código.');
      setPendingSignUpEmail(null);
      setAuthDeepLink(idleDeepLink);
      await hydrate(data.session);
    },
    clearPendingSignUpEmail: () => setPendingSignUpEmail(null),
    signIn: async (email, password) => {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (signInError) {
        if (signInError.message.toLowerCase().includes('email not confirmed')) setPendingSignUpEmail(normalizedEmail);
        throw new Error(authMessage(signInError));
      }
      setPendingSignUpEmail(null);
      setAuthDeepLink((current) => current.status === 'error' && current.purpose === 'signup' ? idleDeepLink : current);
      await hydrate(data.session);
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
      if (!passwordRecoveryActive.current || !passwordRecovery || !session?.user) throw new Error('Abre un enlace de recuperación válido antes de continuar.');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(authMessage(updateError));
      passwordRecoveryActive.current = false;
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
  }), [accountProfile, authDeepLink, authLinkInitialized, error, hydrate, loading, passwordRecovery, pendingSignUpEmail, refreshAccountProfile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
