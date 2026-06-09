import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin, supabaseAuth } from '../plugins/supabase.js';

export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) return;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      request.userId = data.user.id;
      request.userRole = profile.role;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
}
