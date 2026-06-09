import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin, supabaseAuth } from '../plugins/supabase.js';

// Extend FastifyRequest to include user info
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
  }
}

/**
 * Middleware: Verify JWT token from Authorization header
 * Populates request.userId and request.userRole
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }

    // Fetch user profile to get role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'User profile not found',
      });
      return;
    }

    request.userId = data.user.id;
    request.userRole = profile.role;
  } catch {
    reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
}
