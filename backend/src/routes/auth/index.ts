import { FastifyInstance } from 'fastify';
import { supabaseAdmin, supabaseAuth } from '../../plugins/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from '../../schemas/auth.schema.js';
import {
  findUserByEmail,
  getProfileRole,
  mapAuthErrorMessage,
} from '../../utils/auth-helpers.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/register — customer app only, always creates customer role
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const email = body.email.trim().toLowerCase();

    try {
      const existingUser = await findUserByEmail(email);

      if (existingUser) {
        const role =
          (await getProfileRole(existingUser.id)) ??
          (existingUser.user_metadata?.role as string | undefined) ??
          'customer';

        if (role === 'admin') {
          return reply.code(403).send({
            statusCode: 403,
            error: 'Registration Not Allowed',
            message:
              'This email is registered as an administrator. Admin accounts cannot be created from the customer app.',
          });
        }

        return reply.code(409).send({
          statusCode: 409,
          error: 'Email Already Exists',
          message:
            'An account with this email already exists. Please sign in instead.',
        });
      }
    } catch (err) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Registration Failed',
        message:
          err instanceof Error
            ? err.message
            : 'Failed to verify email availability',
      });
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password: body.password,
      options: {
        data: {
          name: body.name,
          role: 'customer',
        },
      },
    });

    if (error) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Registration Failed',
        message: mapAuthErrorMessage(error.message),
      });
    }

    // Supabase may return a user with no identities when email already exists
    if (data.user && data.user.identities?.length === 0) {
      return reply.code(409).send({
        statusCode: 409,
        error: 'Email Already Exists',
        message:
          'An account with this email already exists. Please sign in instead.',
      });
    }

    return reply.code(201).send({
      message: 'Registration successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: 'customer',
      },
      session: data.session,
    });
  });

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Authentication Failed',
        message: error.message,
      });
    }

    // Fetch profile for role info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .single();

    const role =
      profile?.role ??
      (data.user.user_metadata?.role as string | undefined) ??
      'customer';

    return reply.send({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name ?? data.user.user_metadata?.name,
        role,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  });

  // POST /auth/forgot-password
  fastify.post('/forgot-password', async (request, reply) => {
    const body = forgotPasswordSchema.parse(request.body);

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(
      body.email
    );

    if (error) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Password Reset Failed',
        message: error.message,
      });
    }

    return reply.send({
      message: 'Password reset email sent. Check your inbox.',
    });
  });

  // GET /auth/me (protected)
  fastify.get(
    '/me',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, name, role, created_at')
        .eq('id', request.userId)
        .single();

      if (error || !profile) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Profile not found',
        });
      }

      return reply.send({
        user: profile,
      });
    }
  );
}
