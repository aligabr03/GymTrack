"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import {
    Dumbbell,
    LayoutDashboard,
    ClipboardList,
    Library,
    TrendingUp,
    Scale,
    LogOut,
    Sun,
    Moon,
    Users,
    Pencil,
    Plus,
    Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        mobileLabel: "Home",
        subtitle: "date",
    },
    {
        href: "/workouts",
        icon: ClipboardList,
        label: "Workouts",
        subtitle: null,
    },
    { href: "/exercises", icon: Library, label: "Exercises", subtitle: null },
    {
        href: "/body",
        icon: Scale,
        label: "Body",
        subtitle: "Weight, body fat & measurements",
    },
    {
        href: "/insights",
        icon: TrendingUp,
        label: "Insights",
        subtitle: "Training trends & progression",
    },
    {
        href: "/friends",
        icon: Users,
        label: "Friends",
        subtitle: "Activity & people",
    },
];

// Bottom tab bar only shows 5 items — the most commonly used
const mobileNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/workouts", icon: ClipboardList, label: "Workouts" },
    { href: "/exercises", icon: Library, label: "Exercises" },
    { href: "/insights", icon: TrendingUp, label: "Insights" },
    { href: "/friends", icon: Users, label: "Friends" },
];

export function AppNav({ user }: { user: User }) {
    const pathname = usePathname();
    const [profileOpen, setProfileOpen] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as "dark" | "light" | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.classList.toggle(
                "light",
                saved === "light",
            );
        }
    }, []);

    useEffect(() => {
        // Ensure each tab/page switch starts from the top.
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.querySelector("main")?.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });
        setProfileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!profileOpen) return;

        const close = () => setProfileOpen(false);
        window.addEventListener("scroll", close, true);
        window.addEventListener("wheel", close, { passive: true });
        window.addEventListener("touchmove", close, { passive: true });

        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("wheel", close);
            window.removeEventListener("touchmove", close);
        };
    }, [profileOpen]);

    function toggleTheme() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("light", next === "light");
    }

    // Get current page title from navItems
    const currentPage = navItems.find(
        (item) =>
            pathname === item.href || pathname.startsWith(item.href + "/"),
    ) as ((typeof navItems)[0] & { mobileLabel?: string }) | undefined;
    const currentPageTitle =
        currentPage?.mobileLabel ?? currentPage?.label ?? "GymTrack";
    const currentPageSubtitle =
        currentPage?.subtitle === "date"
            ? new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
              })
            : (currentPage?.subtitle ?? null);

    const initials =
        (user.user_metadata?.name as string | undefined)
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) ??
        user.email?.[0]?.toUpperCase() ??
        "U";

    return (
        <>
            {/* ===== DESKTOP: Side navigation ===== */}
            <aside className="hidden md:flex fixed top-0 left-0 z-40 h-full w-64 flex-col bg-[var(--sidebar)]/95 backdrop-blur-xl border-r border-[var(--border)]">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
                    <div className="p-2 rounded-xl bg-[var(--primary)] shadow-[0_0_16px_var(--primary-glow)]">
                        <Dumbbell className="h-5 w-5 text-[var(--primary-foreground)]" />
                    </div>
                    <div>
                        <span className="text-base font-bold tracking-tight">GymTrack</span>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-widest">Fitness Tracker</p>
                    </div>
                </div>

                {/* Log Workout CTA */}
                <div className="px-3 pt-4 pb-2">
                    <Link href="/workouts/new">
                        <Button className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)] gap-2">
                            <Plus className="h-4 w-4" />
                            Log Workout
                        </Button>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                    {navItems.map(({ href, icon: Icon, label, subtitle }) => {
                        const active =
                            pathname === href ||
                            pathname.startsWith(href + "/");
                        const sub = subtitle === "date"
                            ? new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                            : subtitle;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                                    active
                                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                                )}
                            >
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[var(--primary)] rounded-r-full" />
                                )}
                                <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", active ? "scale-110" : "group-hover:scale-105")} />
                                <div className="flex-1 min-w-0">
                                    <span className="block">{label}</span>
                                    {active && sub && (
                                        <span className="block text-xs text-[var(--primary)]/70 font-normal truncate">{sub}</span>
                                    )}
                                </div>
                                {active && <Zap className="h-3 w-3 shrink-0 opacity-60" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-[var(--border)] p-4 space-y-1">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                        <Avatar className="h-9 w-9 ring-2 ring-[var(--primary)]/30">
                            <AvatarFallback className="text-xs bg-[var(--primary)]/15 text-[var(--primary)] font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {(user.user_metadata?.name as string | undefined) ?? "Athlete"}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/profile/${user.id}`}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit profile
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-red-900/20 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* ===== MOBILE: Bottom tab bar ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around px-2 h-16">
                    {mobileNavItems.map(({ href, icon: Icon, label }) => {
                        const active =
                            pathname === href ||
                            pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl min-w-[3.5rem] touch-manipulation transition-all duration-200",
                                    active
                                        ? "text-[var(--primary)]"
                                        : "text-[var(--muted-foreground)]",
                                )}
                            >
                                <div
                                    className={cn(
                                        "relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-200",
                                        active
                                            ? "bg-[var(--primary)]/15 shadow-[0_0_8px_var(--primary-glow)]"
                                            : "hover:bg-[var(--secondary)]",
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 transition-transform duration-200",
                                            active && "scale-110",
                                        )}
                                    />
                                    {active && (
                                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--primary)] rounded-full" />
                                    )}
                                </div>
                                <span className={cn("text-[9px] font-semibold uppercase tracking-wide", active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile: top header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-[4.5rem] pt-[env(safe-area-inset-top)] bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]">
                        <Dumbbell className="h-4 w-4 text-[var(--primary-foreground)]" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-tight">{currentPageTitle}</h1>
                        {currentPageSubtitle && (
                            <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">{currentPageSubtitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/workouts/new"
                        className="flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_10px_var(--primary-glow)] transition-transform active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-xl hover:bg-[var(--secondary)] transition-colors p-0.5"
                        >
                            <Avatar className="h-9 w-9 ring-2 ring-[var(--primary)]/30">
                                <AvatarFallback className="text-xs bg-[var(--primary)]/15 text-[var(--primary)] font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                        {profileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-2 space-y-0.5 animate-scale-in">
                                    <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1">
                                        <p className="text-sm font-semibold truncate">
                                            {(user.user_metadata?.name as string | undefined) ?? "Athlete"}
                                        </p>
                                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/profile/${user.id}`}
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            setProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        {theme === "dark" ? (<Sun className="h-4 w-4" />) : (<Moon className="h-4 w-4" />)}
                                        {theme === "dark" ? "Light mode" : "Dark mode"}
                                    </button>
                                    <form action={logout}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-red-900/20 hover:text-red-400 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

