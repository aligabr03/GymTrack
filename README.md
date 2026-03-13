# GymTrack

A full-stack gym progression tracker built with Next.js, Supabase, and Prisma.

GymTrack helps you log workouts quickly, track personal records automatically, monitor body metrics, and review training trends with visual insights.

---

## Features

### Workout Logging

- Fast workout flow with exercise grouping and compact set logging.
- Add normal sets, drop sets, and supersets.
- "Add Set" copies the previous set values for faster entry.
- Smart suggestions for workout name and duration based on recent history.
- Required `weight` and `reps` validation before save.
- Workout list grouped by date buckets: Today, Yesterday, Last 3 Days, Last 2 Weeks, Last 3 Months, Older.

### Records & Data Integrity

- Personal records are auto-calculated using estimated 1RM.
- PRs are fully re-synced after workout create/update/delete.
- Deleting a workout also removes stale PR state tied to removed data.

### Body Metrics

- Log body metrics with date, notes, and full history:
    - Weight (kg)
    - Body fat %
    - Waist, hip, chest, arm (cm)
- Delete body metric entries directly from history.

### Insights

- Workout calendar heatmap.
- Muscle group volume balance.
- Exercise progression chart.
- Body Trends line chart with selector (Weight, Body Fat, Waist, Hip, Chest, Arm).
- AI training analysis card.

### UX & Navigation

- Responsive app shell with desktop sidebar and mobile tab bar.
- Mobile header with contextual title/subtitle (including live date on Home).
- Route/tab switch resets scroll to top.
- User menu auto-dismisses on outside tap and scroll.
- Light/Dark mode toggle in user menu with persisted preference.
- Mobile toasts are compact and positioned above the bottom tab bar.

### Auth

- Email/password authentication via Supabase Auth.
- Protected app routes for authenticated users.

---

## Tech Stack

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16 (App Router, TypeScript)                |
| UI         | Tailwind CSS v4, Radix UI primitives, Lucide icons |
| Database   | PostgreSQL (Supabase)                              |
| ORM        | Prisma 7                                           |
| Auth       | Supabase Auth (`@supabase/ssr`)                    |
| Charts     | Recharts                                           |
| Validation | Zod                                                |

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase project

### 2. Install

```bash
git clone <your-repo-url>
cd GymTrack
npm install
```

### 3. Configure environment

Copy and fill environment variables:

```bash
cp .env.example .env.local
```

Required values:

```env
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 4. Set up database schema

```bash
npx prisma db push
```

### 5. Seed exercises

```bash
npx prisma db seed
```

### 6. Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Project Structure

```text
prisma/
  schema.prisma
  seed.ts

src/
  actions/                # Server actions: auth, workouts, exercises, body metrics, insights
  app/
    (app)/                # Protected routes (dashboard, workouts, exercises, body, insights, records)
    auth/                 # Login, register, reset password
    globals.css
    layout.tsx
    page.tsx
  components/
    body/
    exercises/
    insights/
    layout/
    ui/
    workouts/
  generated/prisma/       # Generated Prisma client/types (do not edit)
  lib/                    # Prisma client, Supabase clients, utils, calculations
  proxy.ts                # Route protection / request proxy logic
  types/
```

---

## Available Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start development server             |
| `npm run build`       | Generate Prisma client and build app |
| `npm run start`       | Start production server              |
| `npm run lint`        | Run ESLint                           |
| `npx prisma db push`  | Push schema to database              |
| `npx prisma db seed`  | Seed built-in exercises              |
| `npx prisma studio`   | Open Prisma Studio                   |
| `npx prisma generate` | Regenerate Prisma client             |
