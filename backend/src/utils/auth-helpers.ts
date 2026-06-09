import { supabaseAdmin } from '../plugins/supabase.js';

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error('Failed to verify email availability');
  }

  return (
    data.users.find((user) => user.email?.toLowerCase() === normalized) ?? null
  );
}

export async function getProfileRole(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role ?? null;
}

export function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a while and try again.';
  }
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  return message;
}
