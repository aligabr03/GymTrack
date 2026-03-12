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
    Trophy,
    User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/workouts", icon: ClipboardList, label: "Workouts" },
    { href: "/exercises", icon: Library, label: "Exercises" },
    { href: "/body", icon: Scale, label: "Body" },
    { href: "/insights", icon: TrendingUp, label: "Insights" },
    { href: "/records", icon: Trophy, label: "Records" },
];

// Bottom tab bar only shows 5 items — the most commonly used
const mobileNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/workouts", icon: ClipboardList, label: "Workouts" },
    { href: "/exercises", icon: Library, label: "Exercises" },
    { href: "/insights", icon: TrendingUp, label: "Insights" },
    { href: "/records", icon: Trophy, label: "Records" },
];

export function AppNav({ user }: { user: User }) {
    const pathname = usePathname();
    const [profileOpen, setProfileOpen] = useState(false);

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
            <aside className="hidden md:flex fixed top-0 left-0 z-40 h-full w-64 flex-col bg-[var(--card)]/80 backdrop-blur-xl border-r border-[var(--border)]">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
                    <div className="p-1.5 rounded-lg bg-[var(--secondary)]">
                        <Dumbbell className="h-5 w-5 text-[var(--foreground)]" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        GymTrack
                    </span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const active =
                            pathname === href ||
                            pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    active
                                        ? "bg-[var(--secondary)] text-[var(--foreground)] shadow-sm"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-[var(--border)] p-4 space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-[var(--secondary)] text-[var(--foreground)]">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {(user.user_metadata?.name as
                                    | string
                                    | undefined) ?? "Athlete"}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <form action={logout}>
                        <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="w-full justify-start text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* ===== MOBILE: Bottom tab bar ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around px-1 h-16">
                    {mobileNavItems.map(({ href, icon: Icon, label }) => {
                        const active =
                            pathname === href ||
                            pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl min-w-[3.5rem] touch-manipulation",
                                    active
                                        ? "text-[var(--foreground)]"
                                        : "text-[var(--muted-foreground)]",
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-1 rounded-lg",
                                        active && "bg-[var(--secondary)]",
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5",
                                            active && "scale-110",
                                        )}
                                    />
                                </div>
                                <span className="text-[10px] font-medium">
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile: top bar with user info */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-end px-4 py-3 bg-[var(--background)]/80 backdrop-blur-xl">
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen((v) => !v)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--secondary)] transition-colors"
                    >
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px] bg-[var(--secondary)] text-[var(--foreground)]">
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
                            <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-3 space-y-2 animate-scale-in">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium truncate">
                                        {(user.user_metadata?.name as
                                            | string
                                            | undefined) ?? "Athlete"}
                                    </p>
                                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="border-t border-[var(--border)] pt-2">
                                    <Link
                                        href="/body"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        <Scale className="h-4 w-4" />
                                        Body Metrics
                                    </Link>
                                    <form action={logout}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-red-900/20 hover:text-red-400 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
