import { Dumbbell } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--background)] relative overflow-hidden">
            {/* Background glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[var(--primary)]/6 blur-[100px]" />

            <Link href="/" className="relative flex items-center gap-2.5 mb-8 group">
                <div className="p-2 rounded-xl bg-[var(--primary)] shadow-[0_0_16px_var(--primary-glow)] transition-transform group-hover:scale-105">
                    <Dumbbell className="h-5 w-5 text-[var(--primary-foreground)]" />
                </div>
                <div>
                    <span className="text-xl font-bold tracking-tight block">GymTrack</span>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-widest">Fitness Tracker</p>
                </div>
            </Link>
            <div className="relative w-full max-w-sm">{children}</div>
        </div>
    );
}
