import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-[var(--primary)]" />
          <span className="text-lg font-bold">GymTrack</span>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-8">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-sm text-[var(--muted-foreground)]">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
          Track every rep, every set, every PR
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-3xl">
          Your gym <span className="text-[var(--primary)]">progression</span> at a glance
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-xl">
          Log workouts, track body composition, visualize strength gains, and hit new personal records.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="px-10">Start for free</Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="px-10">Sign in</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl w-full text-left">
          {[
            { icon: Dumbbell, title: "Workout Logging", desc: "Log sets, reps, weight, RPE, and form rating per exercise." },
            { icon: TrendingUp, title: "Body Metrics", desc: "Track weight, body fat, waist, and other measurements over time." },
            { icon: BarChart3, title: "Insights & Charts", desc: "Visualize volume trends, strength progression, and muscle balance." },
            { icon: Shield, title: "Personal Records", desc: "Auto-detected PRs with estimated 1RM from every set you log." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-sm text-[var(--muted-foreground)]">
        GymTrack — built to help you get stronger
      </footer>
    </div>
  );
}
