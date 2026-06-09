import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

/**
 * Consistent error response format: { statusCode, error, message }
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const messages = error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: messages.join('; '),
    });
    return;
  }

  // Handle Fastify validation errors
  if (error.validation) {
    reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
    });
    return;
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    statusCode,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
  });
}
