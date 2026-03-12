import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    return (
        <div className="min-h-dvh flex flex-col md:flex-row">
            <AppNav user={user} />
            <main className="flex-1 min-w-0 md:ml-64 pt-[calc(env(safe-area-inset-top)+4.5rem)] md:pt-0 pb-20 md:pb-0">
                <div className="max-w-6xl mx-auto px-4 pt-2 pb-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
