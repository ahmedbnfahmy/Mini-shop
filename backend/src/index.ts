import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { errorHandler } from './utils/errors.js';
import { authRoutes } from './routes/auth/index.js';
import { productRoutes } from './routes/products/index.js';
import { orderRoutes } from './routes/orders/index.js';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true,
  });

  // Global error handler
  fastify.setErrorHandler(errorHandler);

  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Register routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(productRoutes, { prefix: '/products' });
  await fastify.register(orderRoutes, { prefix: '/orders' });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: env.API_PORT, host: env.API_HOST });
    console.log(`\n🚀 Mini Shop API running at http://localhost:${env.API_PORT}`);
    console.log(`📋 Health check: http://localhost:${env.API_PORT}/health\n`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
