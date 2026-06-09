import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware factory: Restrict access to specific roles
 */
export function authorize(...allowedRoles: string[]) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.userRole || !allowedRoles.includes(request.userRole)) {
      reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }
  };
}
