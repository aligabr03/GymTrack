import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp, BarChart3, Shield, Zap, ChevronRight } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)]">
            {/* Sticky glass header */}
            <header className="sticky top-0 z-50 border-b border-[var(--border)] px-5 py-4 flex items-center justify-between bg-[var(--background)]/80 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[var(--primary)] shadow-[0_0_12px_var(--primary-glow)]">
                        <Dumbbell className="h-4 w-4 text-[var(--primary-foreground)]" />
                    </div>
                    <span className="text-base font-bold tracking-tight">GymTrack</span>
                </div>
                <div className="flex gap-2">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]">
                            Sign in
                        </Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button size="sm" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_10px_var(--primary-glow)]">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center">
                {/* Hero */}
                <section className="relative w-full flex flex-col items-center justify-center text-center px-5 pt-20 pb-16 gap-7 overflow-hidden">
                    {/* Background orbs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-[var(--primary)]/8 blur-[100px]" />
                        <div className="absolute top-1/2 -left-32 w-[300px] h-[300px] rounded-full bg-[var(--primary)]/5 blur-[80px]" />
                        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-[var(--primary)]/5 blur-[60px]" />
                    </div>

                    {/* Pill badge */}
                    <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-sm text-[var(--primary)] font-medium animate-fade-in">
                        <Zap className="h-3.5 w-3.5" />
                        Track every rep, every set, every PR
                    </div>

                    {/* Headline */}
                    <h1 className="relative text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.05] animate-fade-in-up">
                        Your gym{" "}
                        <span className="text-[var(--primary)] drop-shadow-[0_0_20px_rgba(163,230,53,0.4)]">
                            results
                        </span>
                        <br className="hidden sm:block" />
                        {" "}at a glance
                    </h1>

                    <p className="relative text-lg text-[var(--muted-foreground)] max-w-lg animate-fade-in-up">
                        Log workouts, track body composition, visualize strength
                        gains, and crush new personal records.
                    </p>

                    <div className="relative flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center animate-fade-in-up">
                        <Link href="/auth/register" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-bold shadow-[0_0_24px_var(--primary-glow)] text-base px-10 gap-2">
                                Start for free
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/auth/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-10 border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5">
                                Sign in
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Feature cards */}
                <section className="w-full max-w-4xl px-5 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                icon: Dumbbell,
                                title: "Workout Logging",
                                desc: "Log sets, reps, weight, RPE, and form rating per exercise with a fast mobile-first logger.",
                                accent: "from-[var(--primary)]/10 to-transparent",
                            },
                            {
                                icon: TrendingUp,
                                title: "Body Metrics",
                                desc: "Track weight, body fat, waist, and more. See trends over time with beautiful charts.",
                                accent: "from-cyan-400/10 to-transparent",
                            },
                            {
                                icon: BarChart3,
                                title: "Insights & Analytics",
                                desc: "Visualize volume trends, strength progression, and muscle balance with AI-powered summaries.",
                                accent: "from-violet-400/10 to-transparent",
                            },
                            {
                                icon: Shield,
                                title: "Personal Records",
                                desc: "Auto-detect PRs and estimate 1RM from every set you log. Never miss a milestone.",
                                accent: "from-amber-400/10 to-transparent",
                            },
                        ].map(({ icon: Icon, title, desc, accent }) => (
                            <div
                                key={title}
                                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3 overflow-hidden hover:border-[var(--primary)]/30 transition-all duration-300"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                <div className="relative w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors duration-300">
                                    <Icon className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors duration-300" />
                                </div>
                                <div className="relative">
                                    <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
                                    <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-[var(--border)] px-6 py-5 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                    GymTrack — built to help you get stronger
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                    <span className="text-xs text-[var(--primary)]/70 font-medium">Free forever</span>
                </div>
            </footer>
        </div>
    );
}

