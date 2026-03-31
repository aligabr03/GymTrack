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
- View, edit, and delete individual workouts.

### Workout Templates

- Create reusable workout templates with ordered exercises, target sets, reps, and weight.
- Start a new workout directly from a template.

### Records & Data Integrity

- Personal records are auto-calculated using estimated 1RM.
- PRs are fully re-synced after workout create/update/delete.
- Deleting a workout also removes stale PR state tied to removed data.

### Exercise Library

- Browse the built-in exercise library filtered by category and muscle group.
- Create custom exercises tied to your account.

### Body Metrics

- Log body metrics with date, notes, and full history:
    - Weight (kg or lbs)
    - Body fat %
    - Waist, hip, chest, arm (cm)
- Delete body metric entries directly from history.

### Insights

- Workout calendar heatmap.
- Muscle group volume balance chart.
- Exercise progression chart.
- Body trends line chart with selector (Weight, Body Fat, Waist, Hip, Chest, Arm).
- AI training analysis card (cached per user, regenerated when data changes).

### Social

- Follow other users and view their public workout activity in a friends feed.
- User profiles with display name and bio.

### Profile & Settings

- Edit display name and bio.
- Set preferred weight unit (kg or lbs) and body weight unit independently.
- Export all personal data (workouts, body metrics, PRs, templates, custom exercises) as JSON.

### UX & Navigation

- Responsive app shell with desktop sidebar and mobile tab bar.
- Mobile header with contextual title/subtitle (including live date on Home).
- Route/tab switch resets scroll to top.
- User menu auto-dismisses on outside tap and scroll.
- Light/Dark mode toggle with persisted preference via `next-themes`.
- Mobile toasts are compact and positioned above the bottom tab bar.

### Auth

- Email/password authentication via Supabase Auth.
- Password reset flow.
- Protected app routes for authenticated users.

---

## Tech Stack

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16.1.6 (App Router, TypeScript)            |
| UI         | Tailwind CSS v4, Radix UI primitives, Lucide icons |
| Theming    | `next-themes`                                      |
| Database   | PostgreSQL (Supabase)                              |
| ORM        | Prisma 7                                           |
| Auth       | Supabase Auth (`@supabase/ssr`)                    |
| Charts     | Recharts                                           |
| Forms      | React Hook Form + Zod                              |

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

Create a `.env.local` file from the example and fill in the required values:

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
  actions/                # Server actions: auth, workouts, exercises, body metrics, insights, social, export
  app/
    (app)/                # Protected routes: dashboard, workouts, exercises, body, insights, friends, profile
    auth/                 # Login, register, reset password
    globals.css
    layout.tsx
    page.tsx
  components/
    body/
    exercises/
    insights/
    layout/
    profile/
    social/
    ui/
    workouts/
  generated/prisma/       # Generated Prisma client/types (do not edit)
  lib/                    # Prisma client, Supabase clients, utils, calculations
  proxy.ts                # Middleware: route protection
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
