-- ============================================================
-- Mini Shop — Seed Data
-- ============================================================

-- Categories
INSERT INTO categories (id, name, slug) VALUES
  ('a1b2c3d4-1111-1111-1111-000000000001', 'Electronics', 'electronics'),
  ('a1b2c3d4-1111-1111-1111-000000000002', 'Clothing', 'clothing'),
  ('a1b2c3d4-1111-1111-1111-000000000003', 'Home & Kitchen', 'home-kitchen'),
  ('a1b2c3d4-1111-1111-1111-000000000004', 'Sports & Outdoors', 'sports-outdoors');

-- Products (12 products across 4 categories)
INSERT INTO products (name, description, price, image_url, category_id) VALUES
  -- Electronics (3)
  ('Wireless Bluetooth Headphones', 'Premium noise-cancelling over-ear headphones with 40-hour battery life and deep bass.', 79.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'a1b2c3d4-1111-1111-1111-000000000001'),
  ('Smart Watch Pro', 'Fitness tracker with heart rate monitor, GPS, and 7-day battery. Water resistant to 50m.', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'a1b2c3d4-1111-1111-1111-000000000001'),
  ('Portable Bluetooth Speaker', 'Compact waterproof speaker with 360° sound and 12-hour playtime.', 49.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'a1b2c3d4-1111-1111-1111-000000000001'),

  -- Clothing (3)
  ('Classic Denim Jacket', 'Timeless denim jacket with a modern slim fit. Available in multiple washes.', 89.99, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', 'a1b2c3d4-1111-1111-1111-000000000002'),
  ('Running Sneakers', 'Lightweight mesh sneakers with responsive cushioning for daily runs.', 129.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'a1b2c3d4-1111-1111-1111-000000000002'),
  ('Cotton Crew T-Shirt', 'Soft 100% organic cotton t-shirt in a relaxed fit. Perfect everyday essential.', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'a1b2c3d4-1111-1111-1111-000000000002'),

  -- Home & Kitchen (3)
  ('Ceramic Coffee Mug Set', 'Set of 4 handcrafted ceramic mugs in earthy tones. Dishwasher and microwave safe.', 34.99, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', 'a1b2c3d4-1111-1111-1111-000000000003'),
  ('Bamboo Cutting Board', 'Premium organic bamboo cutting board with juice groove and easy-grip handles.', 29.99, 'https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?w=400', 'a1b2c3d4-1111-1111-1111-000000000003'),
  ('Scented Soy Candle', 'Hand-poured lavender and vanilla soy candle in a reusable glass jar. Burns for 60+ hours.', 19.99, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400', 'a1b2c3d4-1111-1111-1111-000000000003'),

  -- Sports & Outdoors (3)
  ('Yoga Mat Premium', 'Extra-thick non-slip yoga mat with alignment lines. Eco-friendly TPE material.', 39.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 'a1b2c3d4-1111-1111-1111-000000000004'),
  ('Stainless Steel Water Bottle', 'Double-wall vacuum insulated bottle. Keeps drinks cold 24hrs or hot 12hrs. 750ml.', 27.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'a1b2c3d4-1111-1111-1111-000000000004'),
  ('Resistance Band Set', 'Set of 5 latex resistance bands with varying tension levels. Includes carry bag.', 22.99, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 'a1b2c3d4-1111-1111-1111-000000000004');

-- NOTE: Demo user accounts should be created via Supabase Auth (dashboard or API).
-- Customer: customer@minishop.com / password123
-- Admin:    admin@minishop.com    / password123
-- After creating them, update the admin profile role:
-- UPDATE profiles SET role = 'admin' WHERE id = '<admin-user-uuid>';
