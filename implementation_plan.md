# Mini Shop — Full-Stack Implementation Plan

Build a complete Mini Shop system with three sub-projects: a Fastify backend API, a React Native (Expo) mobile app, and a React (Vite + Tailwind) admin dashboard, all connected to Supabase.

---

## User Review Required

> [!IMPORTANT]
> **Supabase Project**: This plan assumes you already have (or will create) a Supabase project at [supabase.com](https://supabase.com). You'll need to provide:
> - `SUPABASE_URL`
> - `SUPABASE_ANON_KEY`
> - `SUPABASE_SERVICE_ROLE_KEY`
>
> I can set up the SQL migration scripts, but executing them against your Supabase instance requires these credentials.

> [!WARNING]
> **Tailwind CSS Version**: The task specifies Tailwind CSS for the dashboard. The modern approach (Tailwind v4 + `@tailwindcss/vite` plugin) is used in this plan — no `postcss.config.js` or `tailwind.config.js` needed. Let me know if you prefer Tailwind v3 instead.

---

## Open Questions

1. **Supabase credentials** — Do you already have a Supabase project set up, or should I include instructions for creating one?
2. **Image assets** — Should I generate placeholder product images for the seed data, or will you provide your own?
3. **Routing library (mobile)** — The plan uses `expo-router` (file-based routing). Any preference for `react-navigation` instead?
4. **State management (mobile)** — The plan uses Zustand for cart + auth state. Prefer Context API or another library?
5. **Dashboard routing** — Plan uses `react-router-dom` v7. Any preference?

---

## Project Structure

```
/home/a-fahmy/Documents/Task/
├── backend/             # Fastify API server
├── mobile/              # Expo React Native app
├── dashboard/           # React + Vite admin panel
├── supabase/            # SQL migrations & seed scripts
└── README.md            # Root-level project overview
```

---

## Proposed Changes

### Phase 1 — Supabase Schema & Migrations

Set up the database schema, RLS policies, triggers, and seed data as SQL scripts that can be run against the Supabase project.

#### [NEW] supabase/migrations/001_schema.sql

Complete DDL for all 5 tables:
- `profiles` — extends `auth.users` with `name` and `role` (enum: `customer`, `admin`)
- `categories` — `id`, `name`, `slug` (unique)
- `products` — with `category_id` FK, `is_active` default `true`, `image_url`
- `orders` — with `user_id` FK, `status` enum, `total_amount`, `created_at`
- `order_items` — composite PK (`order_id`, `product_id`), `quantity`, `unit_price`

Includes:
- Foreign key constraints with appropriate `ON DELETE` behavior
- Index on `products.category_id` and `orders.user_id`
- Trigger function `handle_new_user()` to auto-create a profile row when a user signs up via Supabase Auth

#### [NEW] supabase/migrations/002_rls_policies.sql

Row-Level Security policies:
- `profiles`: Users can read their own profile; admins can read all
- `products`: Public read for active products; admin CRUD
- `orders`: Customers can read/create their own; admins can read/update all
- `order_items`: Same access pattern as orders
- `categories`: Public read; admin write

#### [NEW] supabase/seed.sql

Seed data:
- 4 categories (Electronics, Clothing, Home & Kitchen, Sports)
- 12+ products across categories with realistic names, descriptions, prices
- 2 demo user accounts (1 customer, 1 admin) with known credentials

---

### Phase 2 — Backend API (Fastify + TypeScript)

#### [NEW] backend/ (full project scaffold)

```
backend/
├── src/
│   ├── index.ts              # Fastify server entry point
│   ├── config/
│   │   └── env.ts            # Environment variable validation (Zod)
│   ├── plugins/
│   │   ├── supabase.ts       # Supabase client plugin (decorates fastify)
│   │   ├── auth.ts           # JWT verification hook + role decorator
│   │   └── cors.ts           # CORS configuration
│   ├── routes/
│   │   ├── auth/
│   │   │   └── index.ts      # POST /register, /login, /forgot-password, GET /me
│   │   ├── products/
│   │   │   └── index.ts      # GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
│   │   └── orders/
│   │       └── index.ts      # POST /, GET /my, GET /, PATCH /:id/status
│   ├── schemas/              # Zod schemas for request/response validation
│   │   ├── auth.schema.ts
│   │   ├── product.schema.ts
│   │   └── order.schema.ts
│   ├── middleware/
│   │   ├── authenticate.ts   # JWT verification preHandler
│   │   └── authorize.ts      # Role-based access preHandler (admin check)
│   └── utils/
│       └── errors.ts         # Consistent error formatting { statusCode, error, message }
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

**Key implementation details:**
- **Auth flow**: Delegates to Supabase Auth (`supabase.auth.signUp`, `signInWithPassword`, `resetPasswordForEmail`). Backend validates JWT from `Authorization: Bearer <token>` header on protected routes.
- **Zod validation**: Every route body/params/query validated with Zod schemas. Fastify's `setErrorHandler` maps Zod errors to `{ statusCode: 400, error: "Validation Error", message }`.
- **RBAC**: `authenticate` preHandler verifies JWT validity. `authorize('admin')` preHandler checks `profiles.role`.
- **Soft delete**: `DELETE /products/:id` sets `is_active = false`, does not remove the row.
- **Pagination**: `GET /orders` supports `?page=1&limit=20` query params.
- **Search & filter**: `GET /products` supports `?search=keyword&category=slug`.

**Dependencies:**
```
fastify, @supabase/supabase-js, zod, @fastify/cors, @fastify/env
typescript, tsx, @types/node (dev)
```

---

### Phase 3 — Mobile App (Expo + React Native)

#### [NEW] mobile/ (Expo project scaffold)

```
mobile/
├── app/                        # expo-router file-based routes
│   ├── _layout.tsx             # Root layout (auth context provider)
│   ├── (auth)/
│   │   ├── _layout.tsx         # Auth stack layout
│   │   ├── login.tsx           # Login screen
│   │   ├── register.tsx        # Registration screen
│   │   └── forgot-password.tsx # Forgot password screen
│   └── (tabs)/
│       ├── _layout.tsx         # Tab navigator layout
│       ├── index.tsx           # Home / Product catalogue
│       ├── cart.tsx            # Cart & checkout
│       ├── orders.tsx          # Order history
│       └── profile.tsx         # Profile & logout
├── components/
│   ├── ProductCard.tsx         # Product grid item
│   ├── CartItem.tsx            # Cart line item
│   ├── OrderCard.tsx           # Order history row
│   ├── CategoryTabs.tsx        # Horizontal category filter
│   ├── SearchBar.tsx           # Product search input
│   ├── SkeletonLoader.tsx      # Loading skeleton component
│   ├── EmptyState.tsx          # Empty state placeholder
│   └── StatusBadge.tsx         # Order status badge
├── store/
│   ├── authStore.ts            # Zustand — auth state + JWT management
│   └── cartStore.ts            # Zustand — cart items, quantities, totals
├── services/
│   ├── api.ts                  # Base API client (fetch wrapper with JWT injection)
│   ├── authService.ts          # Auth API calls
│   ├── productService.ts       # Product API calls
│   └── orderService.ts         # Order API calls
├── hooks/
│   ├── useAuth.ts              # Auth convenience hook
│   └── useProducts.ts          # Product fetching hook with caching
├── constants/
│   ├── colors.ts               # Design system colors
│   └── typography.ts           # Font sizes, weights
├── .env.example
├── app.json
├── package.json
└── README.md
```

**Key implementation details:**
- **Auth flow**: Login → store JWT in `expo-secure-store` → inject in API headers. Auto-redirect to login on 401 or token expiry.
- **Product catalogue**: Grid layout with `FlatList`, pull-to-refresh, category filter tabs, search bar. Loading skeletons on initial load.
- **Cart**: Zustand store persisted to `AsyncStorage`. Quantity controls (+/-), line item totals, subtotal calculation. Checkout posts to `POST /orders`.
- **Order history**: List with status badges (color-coded: pending=yellow, processing=blue, completed=green, cancelled=red).
- **Polish**: Every screen has loading skeleton, empty state, error state, and pull-to-refresh. Consistent spacing, typography, and color palette throughout.

**Dependencies:**
```
expo, expo-router, expo-secure-store, expo-status-bar
@supabase/supabase-js, zustand
react-native-reanimated (bonus animation)
```

---

### Phase 4 — Admin Dashboard (React + Vite + Tailwind)

#### [NEW] dashboard/ (Vite project scaffold)

```
dashboard/
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Router + layout wrapper
│   ├── index.css               # Tailwind import + global styles
│   ├── layouts/
│   │   └── DashboardLayout.tsx # Sidebar + content area
│   ├── pages/
│   │   ├── LoginPage.tsx       # Admin login
│   │   ├── DashboardPage.tsx   # KPI overview (orders today, revenue, active products)
│   │   ├── ProductsPage.tsx    # Product table + CRUD actions
│   │   ├── ProductFormPage.tsx # Create/edit product form with image upload
│   │   └── OrdersPage.tsx      # Order table + status management
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── KPICard.tsx         # Dashboard metric card
│   │   ├── DataTable.tsx       # Reusable sortable/filterable table
│   │   ├── StatusBadge.tsx     # Order status badge
│   │   ├── ImageUpload.tsx     # Drag-and-drop image upload (Supabase Storage)
│   │   ├── Modal.tsx           # Reusable modal component
│   │   └── ProtectedRoute.tsx  # Auth guard wrapper
│   ├── services/
│   │   ├── api.ts              # API client
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   └── orderService.ts
│   ├── hooks/
│   │   └── useAuth.ts          # Auth hook (context + localStorage)
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

**Key implementation details:**
- **Layout**: Responsive sidebar (collapsible on tablet) with navigation links: Dashboard, Products, Orders.
- **Dashboard KPIs**: 3 metric cards fetching aggregated data (orders today count, total revenue, active product count).
- **Product management**: Paginated table with search. Create/edit form with image upload to Supabase Storage. Toggle `is_active` inline.
- **Order management**: Filterable table (by status). Click row → modal with order items detail. Status dropdown to update order status.
- **Auth**: Admin-only login. JWT stored in `localStorage`. Protected routes redirect to login if unauthenticated.

**Dependencies:**
```
react, react-dom, react-router-dom
@supabase/supabase-js
tailwindcss, @tailwindcss/vite (dev)
typescript, @types/react, @types/react-dom (dev)
```

---

### Phase 5 — Configuration & Documentation

#### [NEW] README.md (root)

Project overview, architecture diagram, and links to sub-project READMEs.

#### [NEW] backend/.env.example, mobile/.env.example, dashboard/.env.example

Each with documented environment variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # backend only
API_PORT=3000                                     # backend only
API_URL=http://localhost:3000                      # mobile + dashboard
```

---

## Implementation Order

| Step | Component | Estimated Effort | Dependencies |
|:-----|:----------|:-----------------|:-------------|
| 1 | Supabase SQL migrations + seed data | ~30 min | Supabase credentials |
| 2 | Backend: Project scaffold + env config | ~20 min | Step 1 |
| 3 | Backend: Auth routes (register, login, me) | ~45 min | Step 2 |
| 4 | Backend: Product routes (CRUD + search) | ~40 min | Step 3 |
| 5 | Backend: Order routes (create, list, status) | ~40 min | Step 4 |
| 6 | Dashboard: Project scaffold + layout | ~30 min | Step 2 |
| 7 | Dashboard: Login + auth guard | ~30 min | Step 3 |
| 8 | Dashboard: Product management pages | ~60 min | Step 4 |
| 9 | Dashboard: Order management + KPI page | ~60 min | Step 5 |
| 10 | Mobile: Project scaffold + auth flow | ~45 min | Step 3 |
| 11 | Mobile: Product catalogue + search | ~60 min | Step 4 |
| 12 | Mobile: Cart + checkout | ~45 min | Step 5 |
| 13 | Mobile: Order history + profile | ~40 min | Step 5 |
| 14 | Polish: skeletons, animations, error states | ~45 min | Steps 10-13 |
| 15 | .env.example files + README docs | ~20 min | All |

---

## Verification Plan

### Automated Tests
- **Backend**: Start the Fastify server and test all endpoints with `curl` / HTTP requests against a running Supabase instance:
  - Auth: register → login → get profile
  - Products: CRUD cycle (create, read, update, soft-delete)
  - Orders: place order → list orders → update status
  - Validation: send malformed requests and verify error format
  - RBAC: verify customer cannot access admin routes

### Manual Verification
- **Dashboard**: Open in browser, login as admin, verify:
  - KPI cards show correct counts
  - Product CRUD works (including image upload)
  - Order status updates reflect correctly
- **Mobile**: Run in Expo Go or simulator, verify:
  - Auth flow (register, login, forgot password)
  - Product browsing with category filters and search
  - Cart management and checkout
  - Order history displays with correct status badges
  - Loading skeletons and empty states render properly
