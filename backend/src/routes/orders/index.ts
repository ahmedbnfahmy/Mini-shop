import { FastifyInstance } from 'fastify';
import { supabaseAdmin } from '../../plugins/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../../schemas/order.schema.js';

export async function orderRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /orders — Place a new order (authenticated customer)
  fastify.post(
    '/',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = createOrderSchema.parse(request.body);
      const userId = request.userId!;

      // Fetch product prices to calculate totals
      const productIds = body.items.map((item) => item.product_id);
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, price, is_active, name')
        .in('id', productIds);

      if (productsError || !products) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Order Failed',
          message: 'Failed to fetch product information',
        });
      }

      // Validate all products exist and are active
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of body.items) {
        const product = productMap.get(item.product_id);
        if (!product) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Order Failed',
            message: `Product ${item.product_id} not found`,
          });
        }
        if (!product.is_active) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Order Failed',
            message: `Product "${product.name}" is no longer available`,
          });
        }
      }

      // Calculate total
      const totalAmount = body.items.reduce((sum, item) => {
        const product = productMap.get(item.product_id)!;
        return sum + product.price * item.quantity;
      }, 0);

      // Create the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError || !order) {
        return reply.code(500).send({
          statusCode: 500,
          error: 'Order Failed',
          message: orderError?.message || 'Failed to create order',
        });
      }

      // Create order items
      const orderItems = body.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: productMap.get(item.product_id)!.price,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback: delete the order
        await supabaseAdmin.from('orders').delete().eq('id', order.id);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Order Failed',
          message: 'Failed to create order items',
        });
      }

      // Return the complete order with items
      const { data: completeOrder } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*, products(name, image_url))')
        .eq('id', order.id)
        .single();

      return reply.code(201).send({ order: completeOrder });
    }
  );

  // GET /orders/my — Customer's own orders (authenticated)
  fastify.get(
    '/my',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.userId!;

      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*, products(name, image_url, price))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return reply.code(500).send({
          statusCode: 500,
          error: 'Database Error',
          message: error.message,
        });
      }

      return reply.send({ orders: data });
    }
  );

  // GET /orders — All orders (admin only, paginated)
  fastify.get(
    '/',
    { preHandler: [authenticate, authorize('admin')] },
    async (request, reply) => {
      const query = orderQuerySchema.parse(request.query);
      const { status, page, limit } = query;
      const offset = (page - 1) * limit;

      let queryBuilder = supabaseAdmin
        .from('orders')
        .select('*, profiles(name, role), order_items(*, products(name))', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }

      const { data, error, count } = await queryBuilder;

      if (error) {
        return reply.code(500).send({
          statusCode: 500,
          error: 'Database Error',
          message: error.message,
        });
      }

      const statusCounts = await Promise.all(
        (['pending', 'processing', 'completed', 'cancelled'] as const).map(
          async (s) => {
            const { count: statusCount } = await supabaseAdmin
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('status', s);
            return [s, statusCount || 0] as const;
          }
        )
      );

      return reply.send({
        orders: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats: Object.fromEntries(statusCounts),
      });
    }
  );

  // PATCH /orders/:id/status — Update order status (admin only)
  fastify.patch(
    '/:id/status',
    { preHandler: [authenticate, authorize('admin')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateOrderStatusSchema.parse(request.body);

      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ status: body.status })
        .eq('id', id)
        .select('*, order_items(*, products(name))')
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
          message: 'Order not found',
        });
      }

      return reply.send({
        message: `Order status updated to ${body.status}`,
        order: data,
      });
    }
  );
}
