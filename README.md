# Mini Shop Full-Stack App

This is a comprehensive full-stack solution built for the Mini Shop Developer Task.

## Projects

1. **Backend API** (`/backend`)
   - Fastify (v5) + TypeScript
   - Zod validation
   - Connects to Supabase Database
   - Provides REST APIs for auth, products, and orders.
   - Run: `npm install && npm run dev`

2. **Mobile App** (`/mobile`)
   - React Native + Expo (SDK 56)
   - Expo Router for navigation
   - Zustand for state management
   - Run: `npm install && npm start`

3. **Admin Dashboard** (`/dashboard`)
   - React + Vite + Tailwind CSS (v4)
   - React Router for routing
   - Run: `npm install && npm run dev`

## Setup Instructions

1. **Supabase**: Create a new project in Supabase.
2. **Migrations**: Go to the Supabase SQL Editor and run the 3 SQL files provided in `/supabase/migrations` and `/supabase/seed.sql` to initialize the database schema, RLS policies, and seed data.
3. **Environment**: Copy the `.env.example` in each subfolder to `.env` and fill in the required Supabase URL and keys. Note: For the Mobile App, you must provide your IP address (e.g. `http://192.168.1.xxx:3000`) instead of `localhost` in `EXPO_PUBLIC_API_URL` so your phone or emulator can connect to the backend server.
4. **Run Services**: Start the backend first, then the dashboard and mobile app as needed.
