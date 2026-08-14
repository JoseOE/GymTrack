import type { User } from '@supabase/supabase-js';

import type { AccountProfile } from '@/domain/auth';
import { supabase } from '@/lib/supabase';

type ProfileRow = {
  id: string;
  display_name: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): AccountProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function selectProfile(userId: string) {
  const result = await supabase
    .from('profiles')
    .select('id, display_name, onboarding_completed, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();
  if (result.error) throw result.error;
  return result.data ? mapProfile(result.data) : null;
}

export async function getOrCreateAccountProfile(user: User): Promise<AccountProfile> {
  const existing = await selectProfile(user.id);
  if (existing) return existing;

  const displayName = typeof user.user_metadata.display_name === 'string' && user.user_metadata.display_name.trim()
    ? user.user_metadata.display_name.trim()
    : 'Atleta';
  const created = await supabase
    .from('profiles')
    .insert({ id: user.id, display_name: displayName, onboarding_completed: false })
    .select('id, display_name, onboarding_completed, created_at, updated_at')
    .single<ProfileRow>();
  if (!created.error && created.data) return mapProfile(created.data);
  if (created.error?.code === '23505') {
    const racedProfile = await selectProfile(user.id);
    if (racedProfile) return racedProfile;
  }
  throw created.error ?? new Error('No se pudo crear el perfil de cuenta.');
}

export async function updateAccountProfile(userId: string, changes: { displayName?: string; onboardingCompleted?: boolean }) {
  const values: { display_name?: string; onboarding_completed?: boolean; updated_at: string } = { updated_at: new Date().toISOString() };
  if (changes.displayName !== undefined) values.display_name = changes.displayName.trim();
  if (changes.onboardingCompleted !== undefined) values.onboarding_completed = changes.onboardingCompleted;
  const result = await supabase
    .from('profiles')
    .update(values)
    .eq('id', userId)
    .select('id, display_name, onboarding_completed, created_at, updated_at')
    .single<ProfileRow>();
  if (result.error) throw result.error;
  return mapProfile(result.data);
}
