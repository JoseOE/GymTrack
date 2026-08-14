import type { Session } from '@supabase/supabase-js';

import type { AuthDeepLinkPurpose } from '@/domain/auth';
import { supabase } from '@/lib/supabase';

export const SIGNUP_CONFIRMATION_REDIRECT = 'gymtrack://auth/callback';
export const PASSWORD_RECOVERY_REDIRECT = 'gymtrack://reset-password';

type ParsedAuthDeepLink = {
  purpose: AuthDeepLinkPurpose;
  code: string;
  flowId?: string;
};

type AuthDeepLinkResult = {
  purpose: AuthDeepLinkPurpose;
  session: Session;
};

function authLinkPurpose(url: URL): AuthDeepLinkPurpose | null {
  if (url.protocol !== 'gymtrack:') return null;
  if (url.hostname === 'auth' && url.pathname === '/callback') return 'signup';
  if (url.hostname === 'reset-password' && (url.pathname === '' || url.pathname === '/')) return 'recovery';
  return null;
}

export function getAuthDeepLinkPurpose(rawUrl: string): AuthDeepLinkPurpose | null {
  try {
    return authLinkPurpose(new URL(rawUrl));
  } catch {
    return null;
  }
}

function parseAuthDeepLink(rawUrl: string): ParsedAuthDeepLink | null {
  const purpose = getAuthDeepLinkPurpose(rawUrl);
  if (!purpose) return null;
  const url = new URL(rawUrl);

  const fragment = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  if (url.searchParams.has('error') || url.searchParams.has('error_code') || fragment.has('error')) {
    throw new Error('El enlace no es válido o ya expiró. Solicita uno nuevo.');
  }
  const code = url.searchParams.get('code');
  if (!code) throw new Error('El enlace no contiene un código de verificación válido.');
  const flowId = url.searchParams.get('sb_flow_id') ?? undefined;
  return { purpose, code, flowId };
}

export async function exchangeAuthDeepLink(rawUrl: string): Promise<AuthDeepLinkResult | null> {
  const parsed = parseAuthDeepLink(rawUrl);
  if (!parsed) return null;
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    parsed.code,
    parsed.flowId ? { flowId: parsed.flowId } : undefined,
  );
  if (error) throw error;
  if (!data.session) throw new Error('Supabase no devolvió una sesión válida.');
  return { purpose: parsed.purpose, session: data.session };
}
