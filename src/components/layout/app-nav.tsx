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
  Menu,
  X,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workouts", icon: ClipboardList, label: "Workouts" },
  { href: "/exercises", icon: Library, label: "Exercises" },
  { href: "/body", icon: Scale, label: "Body Metrics" },
  { href: "/insights", icon: TrendingUp, label: "Insights" },
  { href: "/records", icon: Trophy, label: "Records" },
];

export function AppNav({ user }: { user: User }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user.user_metadata?.name as string | undefined)
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[var(--primary)]" />
          <span className="font-bold">GymTrack</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-[var(--secondary)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 flex flex-col bg-[var(--card)] border-r border-[var(--border)] transition-transform duration-200",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--border)]">
          <Dumbbell className="h-6 w-6 text-[var(--primary)]" />
          <span className="text-lg font-bold">GymTrack</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
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
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {(user.user_metadata?.name as string | undefined) ?? "Athlete"}
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

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
