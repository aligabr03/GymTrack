# GymTrack

A full-stack gym progression tracking web app built with **Next.js 15**, **Supabase**, and **Prisma**.

Track your workouts, weights, body measurements, and visualize your progress with charts and personal records.

---

## Features

- **Workout Logging** — log exercises, sets, reps, weight, form rating (1–5), and RPE per set
- **Exercise Library** — 60+ built-in exercises; add your own custom ones
- **Personal Records** — automatically tracked when you log a workout (Brzycki estimated 1RM)
- **Body Metrics** — log weight, body fat %, waist, hip, chest, arm with full history
- **Insights** — weekly volume bar chart, exercise progression line chart, muscle group balance, workout calendar heatmap
- **Authentication** — email/password sign-up and login via Supabase Auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 |
| Auth | Supabase Auth (@supabase/ssr) |
| Charts | Recharts |
| Validation | Zod |
| Forms | React Hook Form |

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone and install

```bash
git clone <your-repo-url>
cd GymTrack
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these in your Supabase project under **Settings -> Database** and **Settings -> API**.

### 4. Push the database schema

```bash
npx prisma db push
```

### 5. Seed the exercise library

```bash
npx prisma db seed
```

This adds 60+ built-in exercises across all muscle groups.

### 6. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 and sign up for an account.

---

## Project Structure

```
src/
  actions/          # Server actions (auth, workouts, exercises, body metrics, insights)
  app/
    (app)/          # Protected routes (dashboard, workouts, exercises, body, insights, records)
    auth/           # Login, register, reset-password pages
    page.tsx        # Landing page
  components/
    body/           # Body metrics logger
    exercises/      # Exercise library
    insights/       # Recharts chart components
    layout/         # App navigation sidebar
    ui/             # Radix-based UI primitives (Button, Card, Dialog, etc.)
    workouts/       # Workout logger, delete button
  generated/        # Prisma generated client (do not edit)
  lib/              # prisma.ts, supabase clients, utils, calculations
  middleware.ts     # Auth route protection
  types/            # Shared TypeScript types
prisma/
  schema.prisma     # Database schema (7 models)
  seed.ts           # Exercise seed data
```

---

## Available Scripts

| Command | Description |
|---|---|
| npm run dev | Start development server |
| npm run build | Build for production |
| npm run start | Start production server |
| npx prisma db push | Push schema to database |
| npx prisma db seed | Seed exercise library |
| npx prisma studio | Open Prisma Studio UI |
| npx prisma generate | Regenerate Prisma client |
