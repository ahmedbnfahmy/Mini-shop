# Mini Shop Implementation Walkthrough

The Mini Shop full-stack project has been fully implemented! Here is a summary of the completed components and how to get everything running.

---

## 🏗️ Architecture Overview

The system is composed of three main parts, all connected to your Supabase project:
1. **Backend API (`/backend`)**: Built with Fastify and TypeScript. It handles user authentication, product management, and order processing, using Zod for robust input validation.
2. **Admin Dashboard (`/dashboard`)**: Built with React, Vite, and Tailwind CSS. It provides a clean interface for admins to view KPIs, manage products, and update order statuses.
3. **Mobile App (`/mobile`)**: Built with React Native (Expo SDK 56) and Expo Router. It uses Zustand for local state management (cart and auth) and provides a polished shopping experience.

---

## 🚀 Getting Started

### 1. Database Setup
The Supabase REST API does not allow running raw SQL DDL commands (like `CREATE TABLE`). You will need to manually run the migration scripts in your Supabase dashboard:
1. Go to your Supabase project's SQL Editor: [https://supabase.com/dashboard/project/ltthwcbdwsiqauywhdby/sql/new](https://supabase.com/dashboard/project/ltthwcbdwsiqauywhdby/sql/new)
2. Copy and run the contents of `/home/a-fahmy/Documents/Task/supabase/migrations/001_schema.sql`
3. Copy and run the contents of `/home/a-fahmy/Documents/Task/supabase/migrations/002_rls_policies.sql`
4. Copy and run the contents of `/home/a-fahmy/Documents/Task/supabase/seed.sql`

> [!NOTE]
> Don't forget to create the demo user accounts (`customer@minishop.com` and `admin@minishop.com`) in the Supabase Authentication dashboard, and manually set the admin's role to `'admin'` in the `profiles` table.

### 2. Running the Backend
The backend runs on port 3000.
```bash
cd /home/a-fahmy/Documents/Task/backend
npm run dev
```
*Health Check:* [http://localhost:3000/health](http://localhost:3000/health)

### 3. Running the Admin Dashboard
The dashboard will run on Vite's default port (usually 5173).
```bash
cd /home/a-fahmy/Documents/Task/dashboard
npm run dev
```
Log in using the admin account you created in Supabase.

### 4. Running the Mobile App
The mobile app uses your local IP address to connect to the backend. Make sure your phone/emulator and computer are on the same network.
```bash
cd /home/a-fahmy/Documents/Task/mobile
npm start
```
Scan the QR code with the Expo Go app on your phone, or press `a` to run on an Android emulator or `i` for an iOS simulator.

---

## 🎨 Implemented Features

### Mobile App
* **Auth Flow**: Login screen with Supabase Auth and JWT token storage via `expo-secure-store`.
* **Shop Tab**: Product grid with dynamic search filtering and "Add to Cart" functionality.
* **Cart Tab**: Zustand-powered cart state with quantity controls, subtotal calculation, and a checkout button that creates the order in the backend.
* **Orders Tab**: Order history list showing order ID, date, total amount, and color-coded status badges.
* **Profile Tab**: Shows user details and allows signing out.

### Admin Dashboard
* **Secure Access**: Protected routes that strictly enforce the `'admin'` role.
* **KPI Dashboard**: Displays key metrics like Orders Today, Total Revenue, and Active Products.
* **Products Management**: Table view of products with search and active/inactive status toggling.
* **Orders Management**: Table view of all customer orders with the ability to dynamically update order statuses (pending, processing, completed, cancelled).

> [!TIP]
> **Tailwind Configuration**: The dashboard utilizes the modern Tailwind CSS v4 Vite plugin (`@tailwindcss/vite`), which eliminates the need for `tailwind.config.js` and `postcss.config.js`.

Everything is set up and ready for you to explore!
