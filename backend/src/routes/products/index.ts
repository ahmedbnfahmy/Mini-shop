import { FastifyInstance } from 'fastify';
import { supabaseAdmin } from '../../plugins/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../../schemas/product.schema.js';

export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /products — List active products (public, with search & category filter)
  fastify.get('/', async (request, reply) => {
    const query = productQuerySchema.parse(request.query);
    const { search, category, page, limit } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply text search
    if (search) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Apply category filter (by slug)
    if (category) {
      // First get category ID from slug
      const { data: cat } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (cat) {
        queryBuilder = queryBuilder.eq('category_id', cat.id);
      }
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Database Error',
        message: error.message,
      });
    }

    return reply.send({
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  });

  // GET /products/:id — Single product detail (public)
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return reply.send({ product: data });
  });

  // POST /products — Create product (admin only)
  fastify.post(
    '/',
    { preHandler: [authenticate, authorize('admin')] },
    async (request, reply) => {
      const body = createProductSchema.parse(request.body);

      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(body)
        .select('*, categories(name, slug)')
        .single();

      if (error) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Creation Failed',
          message: error.message,
        });
      }

      return reply.code(201).send({ product: data });
    }
  );

  // PATCH /products/:id — Update product (admin only)
  fastify.patch(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateProductSchema.parse(request.body);

      const { data, error } = await supabaseAdmin
        .from('products')
        .update(body)
        .eq('id', id)
        .select('*, categories(name, slug)')
        .single();

      if (error) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Update Failed',
          message: error.message,
        });
      }

      if (!data) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Product not found',
        });
      }

      return reply.send({ product: data });
    }
  );

  // DELETE /products/:id — Soft-delete product (admin only)
  fastify.delete(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
        .select('id, name, is_active')
        .single();

      if (error) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Delete Failed',
          message: error.message,
        });
      }

      if (!data) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Product not found',
        });
      }

      return reply.send({
        message: 'Product deactivated successfully',
        product: data,
      });
    }
  );

  // GET /products/categories — List all categories (public helper)
  fastify.get('/categories', async (_request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Database Error',
        message: error.message,
      });
    }

    return reply.send({ categories: data });
  });
}
