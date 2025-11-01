# PHYSQ – Hybrid Fitness Tracker

Cross‑platform fitness progress tracking application (Android, iOS, Web) built with Expo (React Native + Web), Zustand, React Navigation, Tailwind (NativeWind), Node.js/Express backend, and Supabase for auth, DB, and storage.

## Monorepo Layout

- `frontend/` – Expo app with React Native Web
- `backend/` – Node.js + Express API (TypeScript)
- `supabase/` – SQL migrations, seeds, and RLS policies (to be added next)

## Quick Start

1. Prerequisites
   - Node.js 18+ and npm or pnpm
   - Expo CLI (`npm i -g expo` optional)

2. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev        # opens Expo (web, iOS, Android)
   ```

3. Backend
   ```bash
   cd backend
   npm install
   npm run dev        # starts API on http://localhost:4000
   ```

4. Environment
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/` and fill in Supabase keys.
   - Backend expects a service role key; frontend uses anon key.

Further documentation will be added in `docs/`.
