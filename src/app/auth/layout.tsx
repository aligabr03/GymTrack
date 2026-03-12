import { Dumbbell } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--background)]">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <Dumbbell className="h-7 w-7 text-[var(--foreground)]" />
                <span className="text-xl font-bold">GymTrack</span>
            </Link>
            <div className="w-full max-w-sm">{children}</div>
        </div>
    );
}
