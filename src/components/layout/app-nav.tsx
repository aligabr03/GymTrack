"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    Library,
    Scale,
    TrendingUp,
    Users,
    Dumbbell,
    UserCircle,
    CalendarDays,
    Sun,
    Moon,
    LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/actions/auth";
import { usePageTitle } from "./page-title-context";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobileLabel: "Home" },
    { href: "/workouts", label: "Workouts", icon: ClipboardList },
    { href: "/exercises", label: "Exercises", icon: Library },
    { href: "/body", label: "Body", icon: Scale },
    { href: "/insights", label: "Insights", icon: TrendingUp },
    { href: "/friends", label: "Friends", icon: Users },
];

const MOBILE_TABS = NAV_ITEMS.filter((item) => item.href !== "/body");

function useTheme() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const stored = localStorage.getItem("theme") as "dark" | "light" | null;
        if (stored) {
            setTheme(stored);
            document.documentElement.classList.toggle("light", stored === "light");
        }
    }, []);

    const toggle = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            document.documentElement.classList.toggle("light", next === "light");
            return next;
        });
    }, []);

    return { theme, toggle };
}

export function AppNav({ user }: { user: User }) {
    const pathname = usePathname();
    const { title, subtitle } = usePageTitle();
    const { theme, toggle: toggleTheme } = useTheme();
    const [profileOpen, setProfileOpen] = useState(false);

    const userName =
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Athlete";
    const initials = userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const getPageTitle = () => {
        if (title) return title;
        for (const item of NAV_ITEMS) {
            if (isActive(item.href)) return item.label;
        }
        return "GymTrack";
    };

    const getPageSubtitle = () => subtitle ?? undefined;

    return (
        <>
            {/* Desktop top nav */}
            <header className="hidden md:flex items-center justify-between h-16 fixed top-0 inset-x-0 z-50 glass-subtle border-b border-[var(--border)]">
                <div className="flex items-center gap-1 px-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                            <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">
                            GymTrack
                        </span>
                    </Link>
                </div>

                <nav className="flex items-center gap-0.5">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-primary/10 text-primary shadow-[var(--glow-subtle)]"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)]"
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 pr-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                        title="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen((v) => !v)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                        >
                            <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                                <AvatarFallback className="text-xs bg-primary/10 text-[var(--foreground)]">
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
                                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-2xl glass-elevated p-2 space-y-1 animate-scale-in">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium truncate">
                                            {userName}
                                        </p>
                                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="h-px bg-[var(--border)]" />
                                    <Link
                                        href={`/profile/${user.id}`}
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                                    >
                                        <UserCircle className="h-4 w-4 shrink-0" />
                                        View profile
                                    </Link>
                                    <Link
                                        href="/seasons"
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                                    >
                                        <CalendarDays className="h-4 w-4 shrink-0" />
                                        Seasons
                                    </Link>
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            setProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                                    >
                                        {theme === "dark" ? (
                                            <Sun className="h-4 w-4 shrink-0" />
                                        ) : (
                                            <Moon className="h-4 w-4 shrink-0" />
                                        )}
                                        Toggle theme
                                    </button>
                                    <div className="h-px bg-[var(--border)]" />
                                    <form action={logout}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 shrink-0" />
                                            Sign out
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile top bar */}
            <header className="md:hidden flex items-center justify-between h-14 fixed top-0 inset-x-0 z-50 glass-subtle border-b border-[var(--border)] px-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                        <Dumbbell className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                            {getPageTitle()}
                        </p>
                        {getPageSubtitle() && (
                            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                                {getPageSubtitle()}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="p-1 rounded-full"
                >
                    <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                        <AvatarFallback className="text-xs bg-primary/10 text-[var(--foreground)]">
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
                        <div className="absolute right-4 top-full mt-1 z-50 w-60 rounded-2xl glass-elevated p-2 space-y-1 animate-scale-in">
                            <div className="px-3 py-2">
                                <p className="text-sm font-medium truncate">
                                    {userName}
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)] truncate">
                                    {user.email}
                                </p>
                            </div>
                            <div className="h-px bg-[var(--border)]" />
                            <Link
                                href={`/profile/${user.id}`}
                                onClick={() => setProfileOpen(false)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                            >
                                <UserCircle className="h-4 w-4 shrink-0" />
                                View profile
                            </Link>
                            <Link
                                href="/seasons"
                                onClick={() => setProfileOpen(false)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                            >
                                <CalendarDays className="h-4 w-4 shrink-0" />
                                Seasons
                            </Link>
                            <Link
                                href="/body"
                                onClick={() => setProfileOpen(false)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                            >
                                <Scale className="h-4 w-4 shrink-0" />
                                Body metrics
                            </Link>
                            <button
                                onClick={() => {
                                    toggleTheme();
                                    setProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-4 w-4 shrink-0" />
                                ) : (
                                    <Moon className="h-4 w-4 shrink-0" />
                                )}
                                Toggle theme
                            </button>
                            <div className="h-px bg-[var(--border)]" />
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <LogOut className="h-4 w-4 shrink-0" />
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </header>

            {/* Mobile bottom tabs */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass-elevated border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {MOBILE_TABS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 rounded-xl transition-all duration-200 ${
                                    active
                                        ? "text-primary"
                                        : "text-[var(--muted-foreground)]"
                                }`}
                            >
                                <div
                                    className={`relative flex items-center justify-center h-8 w-14 rounded-xl transition-all duration-200 ${
                                        active
                                            ? "bg-primary/10 shadow-[var(--glow-subtle)]"
                                            : ""
                                    }`}
                                >
                                    <item.icon
                                        className={`h-5 w-5 transition-transform duration-200 ${
                                            active ? "scale-110" : ""
                                        }`}
                                    />
                                </div>
                                <span className="text-[10px] font-medium leading-none">
                                    {item.mobileLabel ?? item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
